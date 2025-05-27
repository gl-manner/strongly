// imports/ui/pages/AgentWorkflow/workflow-components/output/database/executor.js

import { MongoClient } from 'mongodb';
import pg from 'pg';
import mysql from 'mysql2/promise';

export default async function executeDatabaseOutput(context) {
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

    // Process templates in data
    const processedData = processTemplates(data, input);

    // Execute based on database type
    switch (data.databaseType) {
      case 'mongodb':
        result = await executeMongoOperation(connectionString, processedData, input);
        break;

      case 'postgresql':
        result = await executePostgresOperation(connectionString, processedData, input);
        break;

      case 'mysql':
        result = await executeMySQLOperation(connectionString, processedData, input);
        break;

      default:
        throw new Error(`Unsupported database type: ${data.databaseType}`);
    }

    return {
      success: true,
      data: result.data,
      metadata: {
        operation: data.operation,
        affectedDocuments: result.affectedCount,
        insertedIds: result.insertedIds,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        executedAt: new Date(),
        databaseType: data.databaseType
      }
    };

  } catch (error) {
    console.error('Database output error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        operation: data.operation,
        databaseType: data.databaseType
      }
    };
  }
}

function processTemplates(data, input) {
  const processed = { ...data };

  // Process template fields
  const templateFields = ['documents', 'filter', 'update', 'deleteFilter', 'sqlQuery'];

  templateFields.forEach(field => {
    if (processed[field]) {
      processed[field] = processTemplate(processed[field], input);
    }
  });

  return processed;
}

function processTemplate(template, data) {
  if (!template || typeof template !== 'string') return template;

  // Handle {{input}} replacement
  if (template.trim() === '{{input}}') {
    return data;
  }

  // Replace template variables
  let processed = template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    if (value !== undefined) {
      // For JSON templates, stringify objects/arrays
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    return match;
  });

  // Try to parse as JSON if it looks like JSON
  if (processed.trim().startsWith('{') || processed.trim().startsWith('[')) {
    try {
      return JSON.parse(processed);
    } catch (e) {
      // If parsing fails, return as string
      return processed;
    }
  }

  return processed;
}

async function executeMongoOperation(connectionString, data, input) {
  const client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: data.timeout || 30000
  });

  try {
    await client.connect();
    const db = client.db(data.database);
    const collection = db.collection(data.collection);

    let result = {};

    switch (data.operation) {
      case 'insert': {
        const documents = Array.isArray(data.documents) ? data.documents : [data.documents];
        const insertResult = await collection.insertMany(documents);
        result = {
          affectedCount: insertResult.insertedCount,
          insertedIds: Object.values(insertResult.insertedIds),
          data: insertResult
        };
        break;
      }

      case 'update': {
        const filter = data.filter || {};
        const update = data.update || {};

        if (data.updateOptions?.multi) {
          const updateResult = await collection.updateMany(filter, update);
          result = {
            affectedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            data: updateResult
          };
        } else {
          const updateResult = await collection.updateOne(filter, update);
          result = {
            affectedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            data: updateResult
          };
        }
        break;
      }

      case 'upsert': {
        const filter = data.filter || {};
        const update = data.update || {};
        const options = { upsert: true };

        if (data.updateOptions?.multi) {
          const updateResult = await collection.updateMany(filter, update, options);
          result = {
            affectedCount: updateResult.matchedCount + (updateResult.upsertedCount || 0),
            modifiedCount: updateResult.modifiedCount,
            upsertedId: updateResult.upsertedId,
            data: updateResult
          };
        } else {
          const updateResult = await collection.updateOne(filter, update, options);
          result = {
            affectedCount: updateResult.matchedCount + (updateResult.upsertedCount || 0),
            modifiedCount: updateResult.modifiedCount,
            upsertedId: updateResult.upsertedId,
            data: updateResult
          };
        }
        break;
      }

      case 'replace': {
        const filter = data.filter || {};
        const replacement = data.documents || {};
        const replaceResult = await collection.replaceOne(filter, replacement);
        result = {
          affectedCount: replaceResult.matchedCount,
          modifiedCount: replaceResult.modifiedCount,
          data: replaceResult
        };
        break;
      }

      case 'delete': {
        const filter = data.deleteFilter || {};

        if (data.deleteOptions?.multi) {
          const deleteResult = await collection.deleteMany(filter);
          result = {
            affectedCount: deleteResult.deletedCount,
            deletedCount: deleteResult.deletedCount,
            data: deleteResult
          };
        } else {
          const deleteResult = await collection.deleteOne(filter);
          result = {
            affectedCount: deleteResult.deletedCount,
            deletedCount: deleteResult.deletedCount,
            data: deleteResult
          };
        }
        break;
      }

      default:
        throw new Error(`Unsupported operation: ${data.operation}`);
    }

    return result;

  } finally {
    await client.close();
  }
}

async function executePostgresOperation(connectionString, data, input) {
  const client = new pg.Client(connectionString);

  try {
    await client.connect();

    let result = {};

    if (data.operation === 'custom') {
      // Execute custom SQL
      const queryResult = await client.query(data.sqlQuery);
      result = {
        affectedCount: queryResult.rowCount,
        data: queryResult.rows
      };
    } else {
      // Build SQL based on operation
      let query;
      let values = [];

      switch (data.operation) {
        case 'insert': {
          const records = Array.isArray(data.documents) ? data.documents : [data.documents];
          const columns = Object.keys(records[0]);
          const placeholders = records.map((_, recordIndex) =>
            `(${columns.map((_, colIndex) => `$${recordIndex * columns.length + colIndex + 1}`).join(', ')})`
          ).join(', ');

          query = `INSERT INTO ${data.table} (${columns.join(', ')}) VALUES ${placeholders}`;
          values = records.flatMap(record => columns.map(col => record[col]));

          if (data.onConflict === 'ignore') {
            query += ' ON CONFLICT DO NOTHING';
          } else if (data.onConflict === 'update' && data.conflictColumns?.length > 0) {
            query += ` ON CONFLICT (${data.conflictColumns.join(', ')}) DO UPDATE SET `;
            query += columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
          }

          if (data.returning) {
            query += ' RETURNING *';
          }
          break;
        }

        case 'update': {
          const updateData = data.update || {};
          const filterData = data.filter || {};
          const updateColumns = Object.keys(updateData);
          const filterColumns = Object.keys(filterData);

          query = `UPDATE ${data.table} SET `;
          query += updateColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
          values = updateColumns.map(col => updateData[col]);

          if (filterColumns.length > 0) {
            query += ' WHERE ';
            query += filterColumns.map((col, i) => `${col} = $${updateColumns.length + i + 1}`).join(' AND ');
            values.push(...filterColumns.map(col => filterData[col]));
          }

          if (data.returning) {
            query += ' RETURNING *';
          }
          break;
        }

        case 'upsert': {
          // PostgreSQL doesn't have direct upsert, use INSERT ON CONFLICT
          const records = Array.isArray(data.documents) ? data.documents : [data.documents];
          const columns = Object.keys(records[0]);
          const conflictColumns = data.conflictColumns || ['id'];

          const placeholders = records.map((_, recordIndex) =>
            `(${columns.map((_, colIndex) => `$${recordIndex * columns.length + colIndex + 1}`).join(', ')})`
          ).join(', ');

          query = `INSERT INTO ${data.table} (${columns.join(', ')}) VALUES ${placeholders}`;
          query += ` ON CONFLICT (${conflictColumns.join(', ')}) DO UPDATE SET `;
          query += columns.filter(col => !conflictColumns.includes(col))
            .map(col => `${col} = EXCLUDED.${col}`).join(', ');

          values = records.flatMap(record => columns.map(col => record[col]));

          if (data.returning) {
            query += ' RETURNING *';
          }
          break;
        }

        case 'delete': {
          const filterData = data.deleteFilter || {};
          const filterColumns = Object.keys(filterData);

          query = `DELETE FROM ${data.table}`;

          if (filterColumns.length > 0) {
            query += ' WHERE ';
            query += filterColumns.map((col, i) => `${col} = $${i + 1}`).join(' AND ');
            values = filterColumns.map(col => filterData[col]);
          }

          if (data.returning) {
            query += ' RETURNING *';
          }
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${data.operation}`);
      }

      const queryResult = await client.query(query, values);
      result = {
        affectedCount: queryResult.rowCount,
        data: data.returning ? queryResult.rows : null
      };
    }

    return result;

  } finally {
    await client.end();
  }
}

async function executeMySQLOperation(connectionString, data, input) {
  const connection = await mysql.createConnection(connectionString);

  try {
    let result = {};

    if (data.operation === 'custom') {
      // Execute custom SQL
      const [rows, fields] = await connection.execute(data.sqlQuery);
      result = {
        affectedCount: rows.affectedRows || rows.length,
        data: Array.isArray(rows) ? rows : null
      };
    } else {
      // Build SQL based on operation
      let query;
      let values = [];

      switch (data.operation) {
        case 'insert': {
          const records = Array.isArray(data.documents) ? data.documents : [data.documents];
          const columns = Object.keys(records[0]);
          const placeholders = records.map(() =>
            `(${columns.map(() => '?').join(', ')})`
          ).join(', ');

          query = `INSERT INTO ${data.table} (${columns.join(', ')}) VALUES ${placeholders}`;
          values = records.flatMap(record => columns.map(col => record[col]));

          if (data.onConflict === 'ignore') {
            query = query.replace('INSERT', 'INSERT IGNORE');
          } else if (data.onConflict === 'update') {
            query += ' ON DUPLICATE KEY UPDATE ';
            query += columns.map(col => `${col} = VALUES(${col})`).join(', ');
          }
          break;
        }

        case 'update': {
          const updateData = data.update || {};
          const filterData = data.filter || {};
          const updateColumns = Object.keys(updateData);
          const filterColumns = Object.keys(filterData);

          query = `UPDATE ${data.table} SET `;
          query += updateColumns.map(col => `${col} = ?`).join(', ');
          values = updateColumns.map(col => updateData[col]);

          if (filterColumns.length > 0) {
            query += ' WHERE ';
            query += filterColumns.map(col => `${col} = ?`).join(' AND ');
            values.push(...filterColumns.map(col => filterData[col]));
          }
          break;
        }

        case 'upsert': {
          // MySQL upsert using INSERT ON DUPLICATE KEY UPDATE
          const records = Array.isArray(data.documents) ? data.documents : [data.documents];
          const columns = Object.keys(records[0]);
          const placeholders = records.map(() =>
            `(${columns.map(() => '?').join(', ')})`
          ).join(', ');

          query = `INSERT INTO ${data.table} (${columns.join(', ')}) VALUES ${placeholders}`;
          query += ' ON DUPLICATE KEY UPDATE ';
          query += columns.map(col => `${col} = VALUES(${col})`).join(', ');

          values = records.flatMap(record => columns.map(col => record[col]));
          break;
        }

        case 'delete': {
          const filterData = data.deleteFilter || {};
          const filterColumns = Object.keys(filterData);

          query = `DELETE FROM ${data.table}`;

          if (filterColumns.length > 0) {
            query += ' WHERE ';
            query += filterColumns.map(col => `${col} = ?`).join(' AND ');
            values = filterColumns.map(col => filterData[col]);
          }
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${data.operation}`);
      }

      const [rows] = await connection.execute(query, values);
      result = {
        affectedCount: rows.affectedRows,
        insertedIds: data.operation === 'insert' ? [rows.insertId] : null,
        data: data.returning ? rows : null
      };
    }

    return result;

  } finally {
    await connection.end();
  }
}
