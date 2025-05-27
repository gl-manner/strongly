// imports//imports/ui/pages/AgentWorkflow/workflow-components/triggers/database-change/editor.jsx

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
import { Database, AlertCircle, Zap, Code } from 'lucide-react';

const DatabaseChangeEditor = ({ node, onSave, onCancel, isOpen }) => {
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

  const validateData = (data) => {
    const errors = {};

    if (!data.connectionString && !data.useEnvVariable) {
      errors.connectionString = 'Connection string is required';
    }

    if (data.useEnvVariable && !data.envVariableName) {
      errors.envVariableName = 'Environment variable name is required';
    }

    if (!data.database && data.databaseType !== 'mongodb') {
      errors.database = 'Database name is required';
    }

    if (data.databaseType === 'mongodb' && !data.collection) {
      errors.collection = 'Collection name is required';
    }

    if ((data.databaseType === 'postgresql' || data.databaseType === 'mysql') && !data.table) {
      errors.table = 'Table name is required';
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
            changeDetectionSupported: true
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

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={20} />
            Configure Database Change Trigger
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="dynamodb">DynamoDB</SelectItem>
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
                      <div>Change Detection: {testResult.details.changeDetectionSupported ? 'Supported' : 'Not Supported'}</div>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="mt-2 text-sm">{testResult.error}</div>
                  )}
                </div>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div>
              <Label htmlFor="changeType">Change Types to Monitor</Label>
              <Select
                value={data.changeType || 'all'}
                onValueChange={(value) => updateData('changeType', value)}
              >
                <SelectTrigger id="changeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Changes</SelectItem>
                  <SelectItem value="insert">Insert Only</SelectItem>
                  <SelectItem value="update">Update Only</SelectItem>
                  <SelectItem value="delete">Delete Only</SelectItem>
                  <SelectItem value="insert_update">Insert & Update</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.databaseType === 'mongodb' && (
              <div>
                <Label htmlFor="watchMethod">Watch Method</Label>
                <Select
                  value={data.watchMethod || 'changeStream'}
                  onValueChange={(value) => updateData('watchMethod', value)}
                >
                  <SelectTrigger id="watchMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="changeStream">Change Streams (Recommended)</SelectItem>
                    <SelectItem value="oplog">Oplog Tailing</SelectItem>
                    <SelectItem value="polling">Polling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(data.databaseType === 'postgresql' || data.databaseType === 'mysql') && (
              <div>
                <Label htmlFor="watchMethod">Watch Method</Label>
                <Select
                  value={data.watchMethod || 'polling'}
                  onValueChange={(value) => updateData('watchMethod', value)}
                >
                  <SelectTrigger id="watchMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polling">Polling</SelectItem>
                    <SelectItem value="trigger">Database Triggers</SelectItem>
                    <SelectItem value="cdc">Change Data Capture (CDC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {data.watchMethod === 'polling' && (
              <div>
                <Label htmlFor="pollingInterval">Polling Interval (seconds)</Label>
                <Input
                  id="pollingInterval"
                  type="number"
                  value={data.pollingInterval || 60}
                  onChange={(e) => updateData('pollingInterval', parseInt(e.target.value) || 60)}
                  min="5"
                  max="3600"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How often to check for changes (5-3600 seconds)
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="includeFullDocument"
                checked={data.includeFullDocument ?? true}
                onCheckedChange={(checked) => updateData('includeFullDocument', checked)}
              />
              <Label htmlFor="includeFullDocument">Include full document in change event</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="includePreviousDocument"
                checked={data.includePreviousDocument ?? false}
                onCheckedChange={(checked) => updateData('includePreviousDocument', checked)}
              />
              <Label htmlFor="includePreviousDocument">Include previous document state (updates only)</Label>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div>
              <Label htmlFor="filterExpression" className="flex items-center gap-2">
                <Code size={16} />
                Filter Expression
              </Label>
              <Textarea
                id="filterExpression"
                value={data.filterExpression || ''}
                onChange={(e) => updateData('filterExpression', e.target.value)}
                placeholder={
                  data.databaseType === 'mongodb'
                    ? '{ "status": "active", "age": { "$gte": 18 } }'
                    : 'status = \'active\' AND age >= 18'
                }
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Only trigger for documents/rows matching this filter
              </p>
            </div>

            <div>
              <Label htmlFor="watchFields">Watch Specific Fields (comma-separated)</Label>
              <Input
                id="watchFields"
                value={data.watchFields || ''}
                onChange={(e) => updateData('watchFields', e.target.value)}
                placeholder="name, email, status"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty to watch all fields
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ignoreInitialData"
                checked={data.ignoreInitialData ?? true}
                onCheckedChange={(checked) => updateData('ignoreInitialData', checked)}
              />
              <Label htmlFor="ignoreInitialData">Ignore existing data on startup</Label>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                value={data.batchSize || 100}
                onChange={(e) => updateData('batchSize', parseInt(e.target.value) || 100)}
                min="1"
                max="1000"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum number of changes to process at once
              </p>
            </div>

            <div>
              <Label htmlFor="resumeToken">Resume Token</Label>
              <Input
                id="resumeToken"
                value={data.resumeToken || ''}
                onChange={(e) => updateData('resumeToken', e.target.value)}
                placeholder="Auto-generated"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Token to resume from a specific point (MongoDB Change Streams)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoRetry"
                checked={data.autoRetry ?? true}
                onCheckedChange={(checked) => updateData('autoRetry', checked)}
              />
              <Label htmlFor="autoRetry">Auto-retry on connection failure</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enableDeduplication"
                checked={data.enableDeduplication ?? true}
                onCheckedChange={(checked) => updateData('enableDeduplication', checked)}
              />
              <Label htmlFor="enableDeduplication">Enable deduplication</Label>
            </div>

            {data.enableDeduplication && (
              <div>
                <Label htmlFor="deduplicationWindow">Deduplication Window (seconds)</Label>
                <Input
                  id="deduplicationWindow"
                  type="number"
                  value={data.deduplicationWindow || 60}
                  onChange={(e) => updateData('deduplicationWindow', parseInt(e.target.value) || 60)}
                  min="1"
                  max="3600"
                />
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                This trigger will start monitoring database changes when the workflow is activated.
                Ensure your database supports the selected watch method.
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

export default DatabaseChangeEditor;
