// imports/ui/pages/AgentWorkflow/workflow-components/data/database/editor.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '/imports/ui/components/ui';
import { Button } from '/imports/ui/components/ui';
import { Input } from '/imports/ui/components/ui';
import { Label } from '/imports/ui/components/ui';
import { Textarea } from '/imports/ui/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/imports/ui/components/ui';
import { Switch } from '/imports/ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '/imports/ui/components/ui';
import { Alert } from '/imports/ui/components/ui';
import { Database, AlertCircle, Code } from 'lucide-react';

const DatabaseEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const validationErrors = validateData(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateData = (data) => {
    const errors = {};

    if (!data.useEnvVariable && !data.connectionString) {
      errors.connectionString = 'Connection string is required';
    }

    if (data.useEnvVariable && !data.envVariableName) {
      errors.envVariableName = 'Environment variable name is required';
    }

    if (!data.database && data.databaseType !== 'mongodb') {
      errors.database = 'Database name is required';
    }

    if (data.databaseType === 'mongodb' && !data.collection && data.queryType !== 'sql') {
      errors.collection = 'Collection name is required';
    }

    if ((data.databaseType === 'postgresql' || data.databaseType === 'mysql') && !data.table && data.queryType !== 'sql') {
      errors.table = 'Table name is required';
    }

    if (!data.query && data.queryType === 'sql') {
      errors.query = 'SQL query is required';
    }

    return errors;
  };

  const getQueryPlaceholder = () => {
    if (data.queryType === 'sql') {
      return 'SELECT * FROM users WHERE active = true';
    }
    if (data.databaseType === 'mongodb') {
      if (data.queryType === 'find') {
        return '{ "status": "active", "age": { "$gte": 18 } }';
      }
      if (data.queryType === 'aggregate') {
        return '[{ "$match": { "status": "active" } }, { "$group": { "_id": "$category", "count": { "$sum": 1 } } }]';
      }
    }
    return '{}';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={20} />
            Configure Database Query
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
            <div>
              <Label htmlFor="databaseType">Database Type</Label>
              <Select
                value={data.databaseType || 'mongodb'}
                onValueChange={(value) => updateData('databaseType', value)}
              >
                <SelectTrigger id="databaseType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useEnvVariable"
                checked={data.useEnvVariable ?? true}
                onChange={(e) => updateData('useEnvVariable', e.target.checked)}
              />
              <Label htmlFor="useEnvVariable">Use environment variable</Label>
            </div>

            {data.useEnvVariable ? (
              <div>
                <Label htmlFor="envVariableName">Environment Variable Name</Label>
                <Input
                  id="envVariableName"
                  value={data.envVariableName || ''}
                  onChange={(e) => updateData('envVariableName', e.target.value)}
                  placeholder="DATABASE_URL"
                  className={errors.envVariableName ? 'border-red-500' : ''}
                  error={!!errors.envVariableName}
                />
                {errors.envVariableName && (
                  <p className="text-sm text-red-500 mt-1">{errors.envVariableName}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Make sure this environment variable is set in your server
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="connectionString">Connection String</Label>
                <Input
                  id="connectionString"
                  type="password"
                  value={data.connectionString || ''}
                  onChange={(e) => updateData('connectionString', e.target.value)}
                  placeholder={
                    data.databaseType === 'mongodb'
                      ? 'mongodb://localhost:27017/mydb'
                      : data.databaseType === 'postgresql'
                      ? 'postgresql://user:password@localhost:5432/mydb'
                      : 'mysql://user:password@localhost:3306/mydb'
                  }
                  className={errors.connectionString ? 'border-red-500' : ''}
                  error={!!errors.connectionString}
                />
                {errors.connectionString && (
                  <p className="text-sm text-red-500 mt-1">{errors.connectionString}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                value={data.database || ''}
                onChange={(e) => updateData('database', e.target.value)}
                placeholder="myDatabase"
                className={errors.database ? 'border-red-500' : ''}
                error={!!errors.database}
              />
              {errors.database && (
                <p className="text-sm text-red-500 mt-1">{errors.database}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div>
              <Label htmlFor="queryType">Query Type</Label>
              <Select
                value={data.queryType || 'find'}
                onValueChange={(value) => updateData('queryType', value)}
              >
                <SelectTrigger id="queryType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.databaseType === 'mongodb' ? (
                    <>
                      <SelectItem value="find">Find Documents</SelectItem>
                      <SelectItem value="findOne">Find One Document</SelectItem>
                      <SelectItem value="aggregate">Aggregation Pipeline</SelectItem>
                      <SelectItem value="sql">Raw Query</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="sql">SQL Query</SelectItem>
                      <SelectItem value="find">Select All</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {data.databaseType === 'mongodb' && data.queryType !== 'sql' && (
              <div>
                <Label htmlFor="collection">Collection Name</Label>
                <Input
                  id="collection"
                  value={data.collection || ''}
                  onChange={(e) => updateData('collection', e.target.value)}
                  placeholder="users"
                  className={errors.collection ? 'border-red-500' : ''}
                  error={!!errors.collection}
                />
                {errors.collection && (
                  <p className="text-sm text-red-500 mt-1">{errors.collection}</p>
                )}
              </div>
            )}

            {(data.databaseType === 'postgresql' || data.databaseType === 'mysql') && data.queryType !== 'sql' && (
              <div>
                <Label htmlFor="table">Table Name</Label>
                <Input
                  id="table"
                  value={data.table || ''}
                  onChange={(e) => updateData('table', e.target.value)}
                  placeholder="users"
                  className={errors.table ? 'border-red-500' : ''}
                  error={!!errors.table}
                />
                {errors.table && (
                  <p className="text-sm text-red-500 mt-1">{errors.table}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="query" className="flex items-center gap-2">
                <Code size={16} />
                {data.queryType === 'sql' ? 'SQL Query' : 'Query Filter (JSON)'}
              </Label>
              <Textarea
                id="query"
                value={data.query || ''}
                onChange={(e) => updateData('query', e.target.value)}
                placeholder={getQueryPlaceholder()}
                rows={6}
                className={`font-mono text-sm ${errors.query ? 'border-red-500' : ''}`}
                error={!!errors.query}
              />
              {errors.query && (
                <p className="text-sm text-red-500 mt-1">{errors.query}</p>
              )}
            </div>

            {data.databaseType === 'mongodb' && data.queryType === 'find' && (
              <>
                <div>
                  <Label htmlFor="projection">Projection (JSON)</Label>
                  <Textarea
                    id="projection"
                    value={typeof data.projection === 'string' ? data.projection : JSON.stringify(data.projection || {})}
                    onChange={(e) => updateData('projection', e.target.value)}
                    placeholder='{ "name": 1, "email": 1, "_id": 0 }'
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Specify which fields to include (1) or exclude (0)
                  </p>
                </div>

                <div>
                  <Label htmlFor="sort">Sort (JSON)</Label>
                  <Textarea
                    id="sort"
                    value={typeof data.sort === 'string' ? data.sort : JSON.stringify(data.sort || {})}
                    onChange={(e) => updateData('sort', e.target.value)}
                    placeholder='{ "createdAt": -1 }'
                    rows={2}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use 1 for ascending, -1 for descending
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {(data.queryType === 'find' || data.queryType === 'sql') && (
              <>
                <div>
                  <Label htmlFor="limit">Limit Results</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={data.limit || 100}
                    onChange={(e) => updateData('limit', parseInt(e.target.value) || 0)}
                    min="0"
                    max="10000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum number of records to return (0 = no limit)
                  </p>
                </div>

                <div>
                  <Label htmlFor="skip">Skip Records</Label>
                  <Input
                    id="skip"
                    type="number"
                    value={data.skip || 0}
                    onChange={(e) => updateData('skip', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of records to skip (for pagination)
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="timeout">Query Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={data.timeout || 30000}
                onChange={(e) => updateData('timeout', parseInt(e.target.value) || 30000)}
                min="1000"
                max="300000"
                step="1000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum time to wait for query to complete
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Query results will be passed to the next component in your workflow.
                Large result sets may impact performance.
              </div>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseEditor;
