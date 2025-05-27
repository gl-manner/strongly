// imports/ui/pages/AgentWorkflow/workflow-components/output/database/editor.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from 'ui/components/ui';
import { Button } from 'ui/components/ui';
import { Input } from 'ui/components/ui';
import { Label } from 'ui/components/ui';
import { Textarea } from 'ui/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/components/ui';
import { Switch } from 'ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/components/ui';
import { Alert } from 'ui/components/ui';
import { Database, AlertCircle, Code, Zap } from 'lucide-react';

const DatabaseOutputEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [errors, setErrors] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateNestedData = (parent, field, value) => {
    setData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
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

    if (data.databaseType === 'mongodb' && !data.collection && data.operation !== 'custom') {
      errors.collection = 'Collection name is required';
    }

    if ((data.databaseType === 'postgresql' || data.databaseType === 'mysql') && !data.table && data.operation !== 'custom') {
      errors.table = 'Table name is required';
    }

    if (data.operation === 'custom' && !data.sqlQuery) {
      errors.sqlQuery = 'SQL query is required for custom operations';
    }

    return errors;
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // In a real implementation, this would test the database connection
      setTimeout(() => {
        setTestResult({
          success: true,
          message: 'Database connection successful',
          details: {
            database: data.database,
            type: data.databaseType,
            collections: data.databaseType === 'mongodb' ? ['users', 'products', 'orders'] : null,
            tables: data.databaseType !== 'mongodb' ? ['users', 'products', 'orders'] : null
          }
        });
        setIsTesting(false);
      }, 1500);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        error: error.message
      });
      setIsTesting(false);
    }
  };

  const getOperationPlaceholder = () => {
    if (data.databaseType === 'mongodb') {
      switch (data.operation) {
        case 'insert':
          return '{{input}} or [{{input}}] for multiple documents';
        case 'update':
          return '{ "$set": { "field": "{{value}}" } }';
        case 'upsert':
          return '{ "$set": {{input}}, "$setOnInsert": { "createdAt": new Date() } }';
        case 'delete':
          return '{ "id": "{{id}}" }';
        default:
          return '{}';
      }
    } else {
      return 'Generated based on operation type';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={20} />
            Configure Database Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="operation">Operation</TabsTrigger>
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
                onCheckedChange={(checked) => updateData('useEnvVariable', checked)}
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
                />
                {errors.envVariableName && (
                  <p className="text-sm text-red-500 mt-1">{errors.envVariableName}</p>
                )}
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
              />
              {errors.database && (
                <p className="text-sm text-red-500 mt-1">{errors.database}</p>
              )}
            </div>

            {data.databaseType === 'mongodb' ? (
              <div>
                <Label htmlFor="collection">Collection Name</Label>
                <Input
                  id="collection"
                  value={data.collection || ''}
                  onChange={(e) => updateData('collection', e.target.value)}
                  placeholder="users"
                  className={errors.collection ? 'border-red-500' : ''}
                />
                {errors.collection && (
                  <p className="text-sm text-red-500 mt-1">{errors.collection}</p>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="table">Table Name</Label>
                <Input
                  id="table"
                  value={data.table || ''}
                  onChange={(e) => updateData('table', e.target.value)}
                  placeholder="users"
                  className={errors.table ? 'border-red-500' : ''}
                />
                {errors.table && (
                  <p className="text-sm text-red-500 mt-1">{errors.table}</p>
                )}
              </div>
            )}

            <div>
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTesting}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <strong>{testResult.message}</strong>
                  {testResult.details && (
                    <div className="mt-2 text-sm">
                      <div>Database: {testResult.details.database}</div>
                      <div>Type: {testResult.details.type}</div>
                      {testResult.details.collections && (
                        <div>Available collections: {testResult.details.collections.join(', ')}</div>
                      )}
                      {testResult.details.tables && (
                        <div>Available tables: {testResult.details.tables.join(', ')}</div>
                      )}
                    </div>
                  )}
                  {testResult.error && (
                    <div className="mt-2 text-sm">{testResult.error}</div>
                  )}
                </div>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="operation" className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation Type</Label>
              <Select
                value={data.operation || 'insert'}
                onValueChange={(value) => updateData('operation', value)}
              >
                <SelectTrigger id="operation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="upsert">Upsert (Insert or Update)</SelectItem>
                  <SelectItem value="replace">Replace</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  {data.databaseType !== 'mongodb' && (
                    <SelectItem value="custom">Custom SQL</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {data.operation === 'insert' && (
              <div>
                <Label htmlFor="documents" className="flex items-center gap-2">
                  <Code size={16} />
                  Documents/Records Template
                </Label>
                <Textarea
                  id="documents"
                  value={data.documents || '{{input}}'}
                  onChange={(e) => updateData('documents', e.target.value)}
                  placeholder={getOperationPlaceholder()}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use {'{{input}}'} to insert the entire input data, or provide a template
                </p>
              </div>
            )}

            {(data.operation === 'update' || data.operation === 'upsert') && (
              <>
                <div>
                  <Label htmlFor="filter" className="flex items-center gap-2">
                    <Code size={16} />
                    Filter Query (Find documents to update)
                  </Label>
                  <Textarea
                    id="filter"
                    value={data.filter || '{}'}
                    onChange={(e) => updateData('filter', e.target.value)}
                    placeholder='{ "id": "{{id}}" } or { "email": "{{email}}" }'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="update" className="flex items-center gap-2">
                    <Code size={16} />
                    Update Operations
                  </Label>
                  <Textarea
                    id="update"
                    value={data.update || '{{input}}'}
                    onChange={(e) => updateData('update', e.target.value)}
                    placeholder={getOperationPlaceholder()}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="updateMulti"
                      checked={data.updateOptions?.multi || false}
                      onCheckedChange={(checked) => updateNestedData('updateOptions', 'multi', checked)}
                    />
                    <Label htmlFor="updateMulti">Update multiple documents</Label>
                  </div>

                  {data.operation === 'upsert' && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="upsert"
                        checked={data.updateOptions?.upsert ?? true}
                        onCheckedChange={(checked) => updateNestedData('updateOptions', 'upsert', checked)}
                      />
                      <Label htmlFor="upsert">Create document if not exists</Label>
                    </div>
                  )}
                </div>
              </>
            )}

            {data.operation === 'replace' && (
              <>
                <div>
                  <Label htmlFor="filter" className="flex items-center gap-2">
                    <Code size={16} />
                    Filter Query
                  </Label>
                  <Textarea
                    id="filter"
                    value={data.filter || '{}'}
                    onChange={(e) => updateData('filter', e.target.value)}
                    placeholder='{ "id": "{{id}}" }'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="documents" className="flex items-center gap-2">
                    <Code size={16} />
                    Replacement Document
                  </Label>
                  <Textarea
                    id="documents"
                    value={data.documents || '{{input}}'}
                    onChange={(e) => updateData('documents', e.target.value)}
                    placeholder='{{input}}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            {data.operation === 'delete' && (
              <>
                <div>
                  <Label htmlFor="deleteFilter" className="flex items-center gap-2">
                    <Code size={16} />
                    Delete Filter
                  </Label>
                  <Textarea
                    id="deleteFilter"
                    value={data.deleteFilter || '{}'}
                    onChange={(e) => updateData('deleteFilter', e.target.value)}
                    placeholder='{ "id": "{{id}}" } or { "status": "inactive" }'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Documents matching this filter will be deleted
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="deleteMulti"
                    checked={data.deleteOptions?.multi || false}
                    onCheckedChange={(checked) => updateNestedData('deleteOptions', 'multi', checked)}
                  />
                  <Label htmlFor="deleteMulti">Delete multiple documents</Label>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    Delete operations are permanent. Test with filters carefully.
                  </div>
                </Alert>
              </>
            )}

            {data.operation === 'custom' && data.databaseType !== 'mongodb' && (
              <div>
                <Label htmlFor="sqlQuery" className="flex items-center gap-2">
                  <Code size={16} />
                  Custom SQL Query
                </Label>
                <Textarea
                  id="sqlQuery"
                  value={data.sqlQuery || ''}
                  onChange={(e) => updateData('sqlQuery', e.target.value)}
                  placeholder="INSERT INTO users (name, email) VALUES ('{{name}}', '{{email}}')"
                  rows={8}
                  className={`font-mono text-sm ${errors.sqlQuery ? 'border-red-500' : ''}`}
                />
                {errors.sqlQuery && (
                  <p className="text-sm text-red-500 mt-1">{errors.sqlQuery}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Use {'{{field}}'} syntax for dynamic values from input data
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div>
              <Label htmlFor="timeout">Operation Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={data.timeout || 30000}
                onChange={(e) => updateData('timeout', parseInt(e.target.value) || 30000)}
                min="1000"
                max="300000"
                step="1000"
              />
            </div>

            {data.databaseType !== 'mongodb' && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="returning"
                    checked={data.returning || false}
                    onCheckedChange={(checked) => updateData('returning', checked)}
                  />
                  <Label htmlFor="returning">Return affected rows</Label>
                </div>

                {data.operation === 'insert' && (
                  <>
                    <div>
                      <Label htmlFor="onConflict">On Conflict Action</Label>
                      <Select
                        value={data.onConflict || 'error'}
                        onValueChange={(value) => updateData('onConflict', value)}
                      >
                        <SelectTrigger id="onConflict">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">Throw Error</SelectItem>
                          <SelectItem value="ignore">Ignore</SelectItem>
                          <SelectItem value="update">Update Existing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {data.onConflict === 'update' && (
                      <div>
                        <Label htmlFor="conflictColumns">Conflict Columns</Label>
                        <Input
                          id="conflictColumns"
                          value={(data.conflictColumns || []).join(', ')}
                          onChange={(e) => updateData('conflictColumns',
                            e.target.value.split(',').map(col => col.trim()).filter(Boolean)
                          )}
                          placeholder="id, email"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Columns to check for conflicts (comma-separated)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Data will be written to the database when this workflow step executes.
                Always test with a small dataset first.
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

export default DatabaseOutputEditor;
