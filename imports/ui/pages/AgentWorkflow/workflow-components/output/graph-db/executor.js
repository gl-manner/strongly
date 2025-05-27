// imports/ui/pages/AgentWorkflow/workflow-components/output/graph-db/executor.js

import neo4j from 'neo4j-driver';
import { Database as ArangoDatabase } from 'arangojs';
import gremlin from 'gremlin';
import AWS from 'aws-sdk';

export default async function executeGraphDBOutput(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Process templates in configuration
    const processedData = processTemplates(data, input);

    // Execute based on provider
    let result;
    switch (data.provider) {
      case 'neo4j':
        result = await executeNeo4jOperation(processedData, env, input);
        break;

      case 'arangodb':
        result = await executeArangoOperation(processedData, env, input);
        break;

      case 'neptune':
        result = await executeNeptuneOperation(processedData, env, input);
        break;

      case 'orientdb':
        result = await executeOrientOperation(processedData, env, input);
        break;

      default:
        throw new Error(`Unsupported graph database provider: ${data.provider}`);
    }

    return {
      success: true,
      data: result.data,
      metadata: {
        operation: data.operation,
        entityType: data.entityType,
        nodesCreated: result.nodesCreated || 0,
        nodesUpdated: result.nodesUpdated || 0,
        nodesDeleted: result.nodesDeleted || 0,
        relationshipsCreated: result.relationshipsCreated || 0,
        relationshipsUpdated: result.relationshipsUpdated || 0,
        relationshipsDeleted: result.relationshipsDeleted || 0,
        executedAt: new Date(),
        provider: data.provider
      }
    };

  } catch (error) {
    console.error('Graph database output error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        operation: data.operation,
        provider: data.provider
      }
    };
  }
}

function processTemplates(data, input) {
  const processed = { ...data };

  // Process string templates
  const templateFields = [
    'nodeLabel', 'nodeProperties', 'nodeIdField',
    'relationshipType', 'fromNodeId', 'toNodeId',
    'cypherQuery'
  ];

  templateFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = processTemplate(processed[field], input);
    }
  });

  // Process object templates
  if (processed.relationshipProperties) {
    processed.relationshipProperties = processObjectTemplate(processed.relationshipProperties, input);
  }

  if (processed.queryParameters) {
    processed.queryParameters = processObjectTemplate(processed.queryParameters, input);
  }

  return processed;
}

function processTemplate(template, data) {
  if (!template || typeof template !== 'string') return template;

  // Handle {{input}} replacement
  if (template.trim() === '{{input}}') {
    return data;
  }

  // Replace template variables
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    return value !== undefined ? value : match;
  });
}

function processObjectTemplate(obj, data) {
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      return obj;
    }
  }

  const processed = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      processed[key] = processTemplate(value, data);
    } else {
      processed[key] = value;
    }
  });

  return processed;
}

async function executeNeo4jOperation(data, env, input) {
  // Get credentials
  const uri = data.useEnvCredentials ? env[`${data.envPrefix}URI`] : data.connectionUri;
  const username = data.useEnvCredentials ? env[`${data.envPrefix}USER`] : data.username;
  const password = data.useEnvCredentials ? env[`${data.envPrefix}PASSWORD`] : data.password;

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    encrypted: data.neo4j?.encryption ?? true,
    trust: data.neo4j?.trustStrategy || 'TRUST_ALL_CERTIFICATES',
    maxConnectionPoolSize: data.neo4j?.maxConnectionPoolSize || 100,
    connectionAcquisitionTimeout: data.neo4j?.connectionAcquisitionTimeout || 60000
  });

  const session = driver.session({ database: data.database || 'neo4j' });

  try {
    let result;

    if (data.operation === 'query') {
      // Execute custom query
      const queryResult = await session.run(data.cypherQuery, data.queryParameters || {});
      result = {
        data: data.returnData ? queryResult.records.map(record => record.toObject()) : null,
        nodesCreated: queryResult.summary?.counters?.nodesCreated() || 0,
        relationshipsCreated: queryResult.summary?.counters?.relationshipsCreated() || 0
      };
    } else {
      // Build and execute operation
      const query = buildNeo4jQuery(data, input);
      const params = buildNeo4jParams(data, input);

      if (data.transactional) {
        result = await session.writeTransaction(async tx => {
          const queryResult = await tx.run(query, params);
          return processNeo4jResult(queryResult, data);
        });
      } else {
        const queryResult = await session.run(query, params);
        result = processNeo4jResult(queryResult, data);
      }
    }

    return result;

  } finally {
    await session.close();
    await driver.close();
  }
}

function buildNeo4jQuery(data, input) {
  switch (data.operation) {
    case 'create':
      if (data.entityType === 'node') {
        return `CREATE (n:${data.nodeLabel} $props) RETURN n`;
      } else if (data.entityType === 'relationship') {
        return buildRelationshipQuery(data, 'CREATE');
      }
      break;

    case 'merge':
      if (data.entityType === 'node') {
        const idField = data.nodeIdField || 'id';
        return `
          MERGE (n:${data.nodeLabel} {${idField}: $id})
          ON CREATE SET n = $props
          ON MATCH SET n += $props
          RETURN n
        `;
      } else if (data.entityType === 'relationship') {
        return buildRelationshipQuery(data, 'MERGE');
      }
      break;

    case 'update':
      if (data.entityType === 'node') {
        const idField = data.nodeIdField || 'id';
        return `
          MATCH (n:${data.nodeLabel} {${idField}: $id})
          SET n += $props
          RETURN n
        `;
      }
      break;

    case 'delete':
      if (data.entityType === 'node') {
        const idField = data.nodeIdField || 'id';
        return `
          MATCH (n:${data.nodeLabel} {${idField}: $id})
          DETACH DELETE n
          RETURN count(n) as deleted
        `;
      }
      break;
  }

  throw new Error(`Unsupported operation: ${data.operation} for entity type: ${data.entityType}`);
}

function buildRelationshipQuery(data, operation) {
  const direction = data.relationshipDirection === 'in' ? '<-' : '-';
  const reverseDirection = data.relationshipDirection === 'in' ? '-' : '->';

  if (operation === 'CREATE') {
    return `
      MATCH (a:${data.fromNodeLabel} {id: $fromId})
      MATCH (b:${data.toNodeLabel} {id: $toId})
      CREATE (a)${direction}[r:${data.relationshipType} $relProps]${reverseDirection}(b)
      RETURN r, a, b
    `;
  } else if (operation === 'MERGE') {
    return `
      MATCH (a:${data.fromNodeLabel} {id: $fromId})
      MATCH (b:${data.toNodeLabel} {id: $toId})
      MERGE (a)${direction}[r:${data.relationshipType}]${reverseDirection}(b)
      ON CREATE SET r = $relProps
      ON MATCH SET r += $relProps
      RETURN r, a, b
    `;
  }
}

function buildNeo4jParams(data, input) {
  const params = {};

  if (data.entityType === 'node' || data.entityType === 'both') {
    // Process node properties
    let props = data.nodeProperties;
    if (typeof props === 'string') {
      try {
        props = JSON.parse(props);
      } catch (e) {
        // If not JSON, use input directly
        props = input;
      }
    }

    params.props = props;
    params.id = props[data.nodeIdField || 'id'];
  }

  if (data.entityType === 'relationship' || data.entityType === 'both') {
    params.fromId = processTemplate(data.fromNodeId, input);
    params.toId = processTemplate(data.toNodeId, input);
    params.relProps = data.relationshipProperties || {};
  }

  return params;
}

function processNeo4jResult(queryResult, data) {
  const result = {
    data: null,
    nodesCreated: queryResult.summary?.counters?.nodesCreated() || 0,
    nodesUpdated: queryResult.summary?.counters?.propertiesSet() > 0 ? 1 : 0,
    nodesDeleted: queryResult.summary?.counters?.nodesDeleted() || 0,
    relationshipsCreated: queryResult.summary?.counters?.relationshipsCreated() || 0,
    relationshipsDeleted: queryResult.summary?.counters?.relationshipsDeleted() || 0
  };

  if (data.returnData) {
    if (data.returnFormat === 'full') {
      result.data = queryResult.records.map(record => record.toObject());
    } else if (data.returnFormat === 'id') {
      result.data = queryResult.records.map(record => {
        const node = record.get('n') || record.get('r');
        return node?.properties?.id || node?.identity?.toString();
      });
    } else if (data.returnFormat === 'count') {
      result.data = { count: queryResult.records.length };
    }
  }

  return result;
}

async function executeArangoOperation(data, env, input) {
  // Get credentials
  const url = data.useEnvCredentials ? env[`${data.envPrefix}URI`] : data.connectionUri;
  const username = data.useEnvCredentials ? env[`${data.envPrefix}USER`] : data.username;
  const password = data.useEnvCredentials ? env[`${data.envPrefix}PASSWORD`] : data.password;

  const db = new ArangoDatabase({
    url,
    auth: username && password ? { username, password } : undefined
  });

  db.useDatabase(data.arangodb?.databaseName || '_system');

  try {
    let result;

    if (data.operation === 'query') {
      // Execute AQL query
      const cursor = await db.query(data.cypherQuery, data.queryParameters || {});
      const results = await cursor.all();

      result = {
        data: data.returnData ? results : null,
        nodesCreated: 0,
        relationshipsCreated: 0
      };
    } else {
      // Execute operation based on entity type
      if (data.entityType === 'node') {
        result = await executeArangoNodeOperation(db, data, input);
      } else if (data.entityType === 'relationship') {
        result = await executeArangoEdgeOperation(db, data, input);
      }
    }

    return result;

  } finally {
    db.close();
  }
}

async function executeArangoNodeOperation(db, data, input) {
  const collection = db.collection(data.nodeLabel);

  // Ensure collection exists
  const exists = await collection.exists();
  if (!exists && data.operation !== 'delete') {
    await collection.create({ type: 'document' });
  }

  let props = data.nodeProperties;
  if (typeof props === 'string') {
    try {
      props = JSON.parse(props);
    } catch (e) {
      props = input;
    }
  }

  const result = {
    data: null,
    nodesCreated: 0,
    nodesUpdated: 0,
    nodesDeleted: 0
  };

  switch (data.operation) {
    case 'create':
      const created = await collection.save(props, {
        returnNew: data.returnData,
        waitForSync: data.arangodb?.waitForSync
      });
      result.nodesCreated = 1;
      result.data = data.returnData ? [created.new] : null;
      break;

    case 'merge':
    case 'update':
      const key = props[data.nodeIdField || '_key'] || props.id;
      const updated = await collection.update(key, props, {
        returnNew: data.returnData,
        mergeObjects: true,
        keepNull: false,
        waitForSync: data.arangodb?.waitForSync
      });
      result.nodesUpdated = 1;
      result.data = data.returnData ? [updated.new] : null;
      break;

    case 'delete':
      const deleteKey = props[data.nodeIdField || '_key'] || props.id;
      await collection.remove(deleteKey, {
        waitForSync: data.arangodb?.waitForSync
      });
      result.nodesDeleted = 1;
      break;
  }

  return result;
}

async function executeArangoEdgeOperation(db, data, input) {
  const collection = db.collection(data.relationshipType);

  // Ensure edge collection exists
  const exists = await collection.exists();
  if (!exists && data.operation !== 'delete') {
    await collection.create({ type: 'edge' });
  }

  const fromId = `${data.fromNodeLabel}/${processTemplate(data.fromNodeId, input)}`;
  const toId = `${data.toNodeLabel}/${processTemplate(data.toNodeId, input)}`;

  const edgeData = {
    _from: fromId,
    _to: toId,
    ...data.relationshipProperties
  };

  const result = {
    data: null,
    relationshipsCreated: 0,
    relationshipsUpdated: 0,
    relationshipsDeleted: 0
  };

  switch (data.operation) {
    case 'create':
      const created = await collection.save(edgeData, {
        returnNew: data.returnData,
        waitForSync: data.arangodb?.waitForSync
      });
      result.relationshipsCreated = 1;
      result.data = data.returnData ? [created.new] : null;
      break;

    case 'merge':
    case 'update':
      // Find existing edge
      const query = `
        FOR e IN ${data.relationshipType}
        FILTER e._from == @from AND e._to == @to
        RETURN e
      `;
      const cursor = await db.query(query, { from: fromId, to: toId });
      const existing = await cursor.next();

      if (existing) {
        const updated = await collection.update(existing._key, data.relationshipProperties, {
          returnNew: data.returnData,
          mergeObjects: true,
          waitForSync: data.arangodb?.waitForSync
        });
        result.relationshipsUpdated = 1;
        result.data = data.returnData ? [updated.new] : null;
      } else if (data.operation === 'merge') {
        const created = await collection.save(edgeData, {
          returnNew: data.returnData,
          waitForSync: data.arangodb?.waitForSync
        });
        result.relationshipsCreated = 1;
        result.data = data.returnData ? [created.new] : null;
      }
      break;
  }

  return result;
}

async function executeNeptuneOperation(data, env, input) {
  const endpoint = data.useEnvCredentials ? env[`${data.envPrefix}URI`] : data.connectionUri;

  if (data.neptune?.engine === 'sparql') {
    return executeNeptuneSparql(endpoint, data, env, input);
  } else {
    return executeNeptuneGremlin(endpoint, data, env, input);
  }
}

async function executeNeptuneGremlin(endpoint, data, env, input) {
  const { DriverRemoteConnection } = gremlin.driver;
  const { Graph } = gremlin.structure;

  // Set up connection
  const dc = new DriverRemoteConnection(endpoint, {
    authenticator: data.neptune?.iamAuth ? new gremlin.driver.auth.SigV4Authenticator() : undefined
  });

  const graph = new Graph();
  const g = graph.traversal().withRemote(dc);

  try {
    let result;

    if (data.operation === 'query') {
      // Execute Gremlin query
      const query = processTemplate(data.cypherQuery, input);
      // This is simplified - actual Gremlin query execution would be more complex
      result = {
        data: null,
        nodesCreated: 0,
        relationshipsCreated: 0
      };
    } else {
      // Build and execute Gremlin traversal
      result = await executeGremlinOperation(g, data, input);
    }

    return result;

  } finally {
    await dc.close();
  }
}

async function executeGremlinOperation(g, data, input) {
  const result = {
    data: null,
    nodesCreated: 0,
    nodesUpdated: 0,
    relationshipsCreated: 0
  };

  let props = data.nodeProperties;
  if (typeof props === 'string') {
    try {
      props = JSON.parse(props);
    } catch (e) {
      props = input;
    }
  }

  switch (data.operation) {
    case 'create':
      if (data.entityType === 'node') {
        let traversal = g.addV(data.nodeLabel);
        Object.entries(props).forEach(([key, value]) => {
          traversal = traversal.property(key, value);
        });
        const vertices = await traversal.toList();
        result.nodesCreated = vertices.length;
        result.data = data.returnData ? vertices : null;
      }
      break;

    case 'update':
      if (data.entityType === 'node') {
        const id = props[data.nodeIdField || 'id'];
        let traversal = g.V().has(data.nodeLabel, data.nodeIdField || 'id', id);
        Object.entries(props).forEach(([key, value]) => {
          if (key !== data.nodeIdField) {
            traversal = traversal.property(key, value);
          }
        });
        const vertices = await traversal.toList();
        result.nodesUpdated = vertices.length;
        result.data = data.returnData ? vertices : null;
      }
      break;
  }

  return result;
}

async function executeNeptuneSparql(endpoint, data, env, input) {
  // Neptune SPARQL implementation would go here
  // This is a placeholder as it requires specific SPARQL client setup
  throw new Error('Neptune SPARQL support not yet implemented');
}

async function executeOrientOperation(data, env, input) {
  // OrientDB implementation would go here
  // This is a placeholder as it requires specific OrientDB client setup
  throw new Error('OrientDB support not yet implemented');
}
