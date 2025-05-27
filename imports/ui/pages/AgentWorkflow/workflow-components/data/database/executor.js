// imports/ui/pages/AgentWorkflow/workflow-components/data/database/executor.js

import { MongoClient } from 'mongodb';
import pg from 'pg';
import mysql from 'mysql2/promise';

export default async function executeDatabase(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  let client;
  let result;

  try {
    // Get connection string
    const connectionString = data.useEnvVariable
      ? env[data.envVariableName]
      : data.connectionString;

    if (!connectionString) {
      throw new Error('No connection string provided');
    }

    // Execute based on database type
    switch (data.databaseType) {
      case 'mongodb':
        result = await executeMongoQuery(connectionString, data);
        break;

      case 'postgresql':
        result = await executePostgresQuery(connectionString, data);
        break;

      case 'mysql':
        result = await executeMySQLQuery(connectionString, data);
        break;

      default:
        throw new Error(`Unsupported database type: ${data.databaseType}`);
    }

    return {
      success: true,
      data: result.data,
      metadata: {
        executedAt: new Date(),
        recordCount: result.count,
        executionTime: result.executionTime,
        databaseType: data.databaseType,
        queryType: data.queryType
      }
    };

  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        stack: error.stack
      }
    };
  } finally {
    // Cleanup connections
    if (client) {
      try {
        if (data.databaseType === 'mongodb' && client.close) {
          await client.close();
        } else if (data.databaseType === 'postgresql' && client.end) {
          await client.end();
        } else if (data.databaseType === 'mysql' && client.end) {
          await client.end();
        }
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

async function executeMongoQuery(connectionString, data) {
  const startTime = Date.now();
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    const db = client.db(data.database);

    let result;
    let count;

    switch (data.queryType) {
      case 'find': {
        const collection = db.collection(data.collection);
        const query = data.query ? JSON.parse(data.query) : {};
        const projection = data.projection ?
          (typeof data.projection === 'string' ? JSON.parse(data.projection) : data.projection) : {};
        const sort = data.sort ?
          (typeof data.sort === 'string' ? JSON.parse(data.sort) : data.sort) : {};

        const cursor = collection.find(query)
          .project(projection)
          .sort(sort)
          .limit(data.limit || 100)
          .skip(data.skip || 0);

        result = await cursor.toArray();
        count = result.length;
        break;
      }

      case 'findOne': {
        const collection = db.collection(data.collection);
        const query = data.query ? JSON.parse(data.query) : {};
        const projection = data.projection ?
          (typeof data.projection === 'string' ? JSON.parse(data.projection) : data.projection) : {};

        result = await collection.findOne(query, { projection });
        count = result ? 1 : 0;
        break;
      }

      case 'aggregate': {
        const collection = db.collection(data.collection);
        const pipeline = data.query ? JSON.parse(data.query) : [];

        result = await collection.aggregate(pipeline).toArray();
        count = result.length;
        break;
      }

      case 'sql': {
        // For MongoDB, this would be a raw command
        const command = JSON.parse(data.query);
        result = await db.command(command);
        count = Array.isArray(result) ? result.length : 1;
        break;
      }

      default:
        throw new Error(`Unsupported query type: ${data.queryType}`);
    }

    const executionTime = Date.now() - startTime;
    return { data: result, count, executionTime };

  } finally {
    await client.close();
  }
}

async function executePostgresQuery(connectionString, data) {
  const startTime = Date.now();
  const client = new pg.Client(connectionString);

  try {
    await client.connect();

    let query;
    let values = [];

    if (data.queryType === 'sql') {
      query = data.query;
    } else if (data.queryType === 'find') {
      // Build a simple SELECT query
      query = `SELECT * FROM ${data.table}`;

      if (data.query) {
        const conditions = JSON.parse(data.query);
        const whereClause = Object.entries(conditions)
          .map(([key, value], index) => {
            values.push(value);
            return `${key} = $${index + 1}`;
          })
          .join(' AND ');

        if (whereClause) {
          query += ` WHERE ${whereClause}`;
        }
      }

      if (data.sort) {
        const sortObj = typeof data.sort === 'string' ? JSON.parse(data.sort) : data.sort;
        const orderClause = Object.entries(sortObj)
          .map(([key, value]) => `${key} ${value > 0 ? 'ASC' : 'DESC'}`)
          .join(', ');

        if (orderClause) {
          query += ` ORDER BY ${orderClause}`;
        }
      }

      if (data.limit) {
        query += ` LIMIT ${data.limit}`;
      }

      if (data.skip) {
        query += ` OFFSET ${data.skip}`;
      }
    }

    const result = await client.query(query, values);
    const executionTime = Date.now() - startTime;

    return {
      data: result.rows,
      count: result.rowCount,
      executionTime
    };

  } finally {
    await client.end();
  }
}

async function executeMySQLQuery(connectionString, data) {
  const startTime = Date.now();

  try {
    const connection = await mysql.createConnection(connectionString);

    let query;
    let values = [];

    if (data.queryType === 'sql') {
      query = data.query;
    } else if (data.queryType === 'find') {
      // Build a simple SELECT query
      query = `SELECT * FROM ${data.table}`;

      if (data.query) {
        const conditions = JSON.parse(data.query);
        const whereClause = Object.entries(conditions)
          .map(([key, value]) => {
            values.push(value);
            return `${key} = ?`;
          })
          .join(' AND ');

        if (whereClause) {
          query += ` WHERE ${whereClause}`;
        }
      }

      if (data.sort) {
        const sortObj = typeof data.sort === 'string' ? JSON.parse(data.sort) : data.sort;
        const orderClause = Object.entries(sortObj)
          .map(([key, value]) => `${key} ${value > 0 ? 'ASC' : 'DESC'}`)
          .join(', ');

        if (orderClause) {
          query += ` ORDER BY ${orderClause}`;
        }
      }

      if (data.limit) {
        query += ` LIMIT ${data.limit}`;
      }

      if (data.skip) {
        query += ` OFFSET ${data.skip}`;
      }
    }

    const [rows] = await connection.execute(query, values);
    await connection.end();

    const executionTime = Date.now() - startTime;

    return {
      data: rows,
      count: Array.isArray(rows) ? rows.length : 0,
      executionTime
    };

  } catch (error) {
    throw error;
  }
}
