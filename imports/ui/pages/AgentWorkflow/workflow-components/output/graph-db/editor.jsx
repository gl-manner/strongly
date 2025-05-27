// imports/ui/pages/AgentWorkflow/workflow-components/output/graph-db/editor.jsx

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
import { GitBranch, AlertCircle, Code, Zap, Database, ArrowRight } from 'lucide-react';

const GraphDBEditor = ({ node, onSave, onCancel, isOpen }) => {
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

    if (!data.connectionUri && !data.useEnvCredentials) {
      errors.connectionUri = 'Connection URI is required';
    }

    if (data.useEnvCredentials && !data.envPrefix) {
      errors.envPrefix = 'Environment variable prefix is required';
    }

    if (!data.database && data.provider !== 'arangodb') {
      errors.database = 'Database name is required';
    }

    if (data.entityType === 'node' && !data.nodeLabel && data.operation !== 'query') {
      errors.nodeLabel = 'Node label is required';
    }

    if (data.entityType === 'relationship' && !data.relationshipType && data.operation !== 'query') {
      errors.relationshipType = 'Relationship type is required';
    }

    if (data.operation === 'query' && !data.cypherQuery) {
      errors.cypherQuery = 'Cypher query is required';
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
          message: 'Graph database connection successful',
          details: {
            provider: data.provider,
            database: data.database,
            version: data.provider === 'neo4j' ? '5.12.0' : '3.11.4',
            nodeCount: 15432,
            relationshipCount: 48921
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

  const getCypherPlaceholder = () => {
    switch (data.operation) {
      case 'create':
        if (data.entityType === 'node') {
          return 'CREATE (n:{{nodeLabel}} {{nodeProperties}}) RETURN n';
        } else {
          return 'MATCH (a:{{fromNodeLabel}} {id: {{fromNodeId}}}), (b:{{toNodeLabel}} {id: {{toNodeId}}}) CREATE (a)-[r:{{relationshipType}} {{relationshipProperties}}]->(b) RETURN r';
        }
      case 'merge':
        return 'MERGE (n:Person {email: {{email}}}) ON CREATE SET n.created = timestamp() ON MATCH SET n.updated = timestamp() RETURN n';
      case 'update':
        return 'MATCH (n:{{nodeLabel}} {id: {{id}}}) SET n += {{properties}} RETURN n';
      case 'delete':
        return 'MATCH (n:{{nodeLabel}} {id: {{id}}}) DETACH DELETE n';
      default:
        return 'MATCH (n) RETURN n LIMIT 10';
    }
  };

  const getGremlinPlaceholder = () => {
    switch (data.operation) {
      case 'create':
        if (data.entityType === 'node') {
          return "g.addV('{{label}}').property('id', '{{id}}').property('name', '{{name}}')";
        } else {
          return "g.V('{{fromId}}').addE('{{label}}').to(g.V('{{toId}}')).property('weight', {{weight}})";
        }
      case 'update':
        return "g.V('{{id}}').property('{{property}}', '{{value}}')";
      case 'delete':
        return "g.V('{{id}}').drop()";
      default:
        return "g.V().limit(10)";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch size={20} />
            Configure Graph Database Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="operation">Operation</TabsTrigger>
            <TabsTrigger value="data">Data Mapping</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
            <div>
              <Label htmlFor="provider">Graph Database Provider</Label>
              <Select
                value={data.provider || 'neo4j'}
                onValueChange={(value) => updateData('provider', value)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neo4j">Neo4j</SelectItem>
                  <SelectItem value="arangodb">ArangoDB</SelectItem>
                  <SelectItem value="neptune">Amazon Neptune</SelectItem>
                  <SelectItem value="orientdb">OrientDB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useEnvCredentials"
                checked={data.useEnvCredentials ?? true}
                onCheckedChange={(checked) => updateData('useEnvCredentials', checked)}
              />
              <Label htmlFor="useEnvCredentials">Use environment variables</Label>
            </div>

            {data.useEnvCredentials ? (
              <div>
                <Label htmlFor="envPrefix">Environment Variable Prefix</Label>
                <Input
                  id="envPrefix"
                  value={data.envPrefix || 'GRAPH_DB_'}
                  onChange={(e) => updateData('envPrefix', e.target.value)}
                  placeholder="GRAPH_DB_"
                  className={errors.envPrefix ? 'border-red-500' : ''}
                />
                {errors.envPrefix && (
                  <p className="text-sm text-red-500 mt-1">{errors.envPrefix}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Will use: {data.envPrefix}URI, {data.envPrefix}USER, {data.envPrefix}PASSWORD
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="connectionUri">Connection URI</Label>
                  <Input
                    id="connectionUri"
                    value={data.connectionUri || ''}
                    onChange={(e) => updateData('connectionUri', e.target.value)}
                    placeholder={
                      data.provider === 'neo4j' ? 'neo4j://localhost:7687' :
                      data.provider === 'arangodb' ? 'http://localhost:8529' :
                      data.provider === 'neptune' ? 'wss://your-cluster.region.neptune.amazonaws.com:8182/gremlin' :
                      'remote:localhost/demodb'
                    }
                    className={errors.connectionUri ? 'border-red-500' : ''}
                  />
                  {errors.connectionUri && (
                    <p className="text-sm text-red-500 mt-1">{errors.connectionUri}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={data.username || ''}
                      onChange={(e) => updateData('username', e.target.value)}
                      placeholder={data.provider === 'neo4j' ? 'neo4j' : 'root'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password || ''}
                      onChange={(e) => updateData('password', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                value={data.database || ''}
                onChange={(e) => updateData('database', e.target.value)}
                placeholder={data.provider === 'neo4j' ? 'neo4j' : '_system'}
                className={errors.database ? 'border-red-500' : ''}
              />
              {errors.database && (
                <p className="text-sm text-red-500 mt-1">{errors.database}</p>
              )}
            </div>

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
                      <div>Provider: {testResult.details.provider}</div>
                      <div>Version: {testResult.details.version}</div>
                      <div>Nodes: {testResult.details.nodeCount?.toLocaleString()}</div>
                      <div>Relationships: {testResult.details.relationshipCount?.toLocaleString()}</div>
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
                value={data.operation || 'create'}
                onValueChange={(value) => updateData('operation', value)}
              >
                <SelectTrigger id="operation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="merge">Merge (Upsert)</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="query">Custom Query</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.operation !== 'query' && (
              <div>
                <Label htmlFor="entityType">Entity Type</Label>
                <Select
                  value={data.entityType || 'node'}
                  onValueChange={(value) => updateData('entityType', value)}
                >
                  <SelectTrigger id="entityType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="node">Node (Vertex)</SelectItem>
                    <SelectItem value="relationship">Relationship (Edge)</SelectItem>
                    <SelectItem value="both">Both (Complex Operation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {data.operation === 'query' && (
              <div>
                <Label htmlFor="cypherQuery" className="flex items-center gap-2">
                  <Code size={16} />
                  {data.provider === 'neptune' && data.neptune?.engine === 'gremlin' ? 'Gremlin Query' : 'Cypher Query'}
                </Label>
                <Textarea
                  id="cypherQuery"
                  value={data.cypherQuery || ''}
                  onChange={(e) => updateData('cypherQuery', e.target.value)}
                  placeholder={
                    data.provider === 'neptune' && data.neptune?.engine === 'gremlin'
                      ? getGremlinPlaceholder()
                      : getCypherPlaceholder()
                  }
                  rows={8}
                  className={`font-mono text-sm ${errors.cypherQuery ? 'border-red-500' : ''}`}
                />
                {errors.cypherQuery && (
                  <p className="text-sm text-red-500 mt-1">{errors.cypherQuery}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Use {'{{field}}'} syntax for dynamic values from input data
                </p>
              </div>
            )}

            {data.provider === 'neptune' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="neptuneEngine">Query Engine</Label>
                  <Select
                    value={data.neptune?.engine || 'gremlin'}
                    onValueChange={(value) => updateNestedData('neptune', 'engine', value)}
                  >
                    <SelectTrigger id="neptuneEngine">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gremlin">Gremlin (Property Graph)</SelectItem>
                      <SelectItem value="sparql">SPARQL (RDF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="iamAuth"
                    checked={data.neptune?.iamAuth || false}
                    onCheckedChange={(checked) => updateNestedData('neptune', 'iamAuth', checked)}
                  />
                  <Label htmlFor="iamAuth">Use IAM Authentication</Label>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            {(data.entityType === 'node' || data.entityType === 'both') && data.operation !== 'query' && (
              <>
                <div>
                  <Label htmlFor="nodeLabel">Node Label/Type</Label>
                  <Input
                    id="nodeLabel"
                    value={data.nodeLabel || ''}
                    onChange={(e) => updateData('nodeLabel', e.target.value)}
                    placeholder="Person, Product, Order, etc."
                    className={errors.nodeLabel ? 'border-red-500' : ''}
                  />
                  {errors.nodeLabel && (
                    <p className="text-sm text-red-500 mt-1">{errors.nodeLabel}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nodeIdField">Node ID Field</Label>
                  <Input
                    id="nodeIdField"
                    value={data.nodeIdField || 'id'}
                    onChange={(e) => updateData('nodeIdField', e.target.value)}
                    placeholder="id"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Field from input data to use as node identifier
                  </p>
                </div>

                <div>
                  <Label htmlFor="nodeProperties" className="flex items-center gap-2">
                    <Code size={16} />
                    Node Properties Template
                  </Label>
                  <Textarea
                    id="nodeProperties"
                    value={data.nodeProperties || '{{input}}'}
                    onChange={(e) => updateData('nodeProperties', e.target.value)}
                    placeholder='{{input}} or { "name": "{{name}}", "email": "{{email}}", "age": {{age}} }'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Template for node properties. Use {'{{input}}'} for all data or specific fields.
                  </p>
                </div>
              </>
            )}

            {(data.entityType === 'relationship' || data.entityType === 'both') && data.operation !== 'query' && (
              <>
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowRight size={16} />
                    Relationship Configuration
                  </h4>

                  <div>
                    <Label htmlFor="relationshipType">Relationship Type</Label>
                    <Input
                      id="relationshipType"
                      value={data.relationshipType || ''}
                      onChange={(e) => updateData('relationshipType', e.target.value)}
                      placeholder="KNOWS, PURCHASED, BELONGS_TO, etc."
                      className={errors.relationshipType ? 'border-red-500' : ''}
                    />
                    {errors.relationshipType && (
                      <p className="text-sm text-red-500 mt-1">{errors.relationshipType}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromNodeLabel">From Node Label</Label>
                      <Input
                        id="fromNodeLabel"
                        value={data.fromNodeLabel || ''}
                        onChange={(e) => updateData('fromNodeLabel', e.target.value)}
                        placeholder="Person"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromNodeId">From Node ID Field</Label>
                      <Input
                        id="fromNodeId"
                        value={data.fromNodeId || ''}
                        onChange={(e) => updateData('fromNodeId', e.target.value)}
                        placeholder="{{fromId}}"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="toNodeLabel">To Node Label</Label>
                      <Input
                        id="toNodeLabel"
                        value={data.toNodeLabel || ''}
                        onChange={(e) => updateData('toNodeLabel', e.target.value)}
                        placeholder="Product"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toNodeId">To Node ID Field</Label>
                      <Input
                        id="toNodeId"
                        value={data.toNodeId || ''}
                        onChange={(e) => updateData('toNodeId', e.target.value)}
                        placeholder="{{toId}}"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="relationshipDirection">Direction</Label>
                    <Select
                      value={data.relationshipDirection || 'out'}
                      onValueChange={(value) => updateData('relationshipDirection', value)}
                    >
                      <SelectTrigger id="relationshipDirection">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="out">Outgoing (→)</SelectItem>
                        <SelectItem value="in">Incoming (←)</SelectItem>
                        <SelectItem value="both">Bidirectional (↔)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="relationshipProperties">Relationship Properties</Label>
                    <Textarea
                      id="relationshipProperties"
                      value={JSON.stringify(data.relationshipProperties || {})}
                      onChange={(e) => {
                        try {
                          updateData('relationshipProperties', JSON.parse(e.target.value));
                        } catch (e) {
                          // Invalid JSON, keep as string
                        }
                      }}
                      placeholder='{ "weight": 1.0, "created": "{{timestamp}}" }'
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {data.operation === 'query' && (
              <div>
                <Label htmlFor="queryParameters">Query Parameters</Label>
                <Textarea
                  id="queryParameters"
                  value={JSON.stringify(data.queryParameters || {})}
                  onChange={(e) => {
                    try {
                      updateData('queryParameters', JSON.parse(e.target.value));
                    } catch (e) {
                      // Invalid JSON, keep as string
                    }
                  }}
                  placeholder='{ "userId": "{{userId}}", "limit": 10 }'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Parameters to pass to the query (JSON format)
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={data.batchSize || 1000}
                  onChange={(e) => updateData('batchSize', parseInt(e.target.value) || 1000)}
                  min="1"
                  max="10000"
                />
              </div>

              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
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
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="transactional"
                checked={data.transactional ?? true}
                onCheckedChange={(checked) => updateData('transactional', checked)}
              />
              <Label htmlFor="transactional">Use transactions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="returnData"
                checked={data.returnData ?? true}
                onCheckedChange={(checked) => updateData('returnData', checked)}
              />
              <Label htmlFor="returnData">Return created/updated data</Label>
            </div>

            <div>
              <Label htmlFor="returnFormat">Return Format</Label>
              <Select
                value={data.returnFormat || 'full'}
                onValueChange={(value) => updateData('returnFormat', value)}
              >
                <SelectTrigger id="returnFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Entity Data</SelectItem>
                  <SelectItem value="id">IDs Only</SelectItem>
                  <SelectItem value="count">Count Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.provider === 'neo4j' && (
              <div className="space-y-4">
                <h4 className="font-medium">Neo4j Specific Settings</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="neo4jEncryption"
                    checked={data.neo4j?.encryption ?? true}
                    onCheckedChange={(checked) => updateNestedData('neo4j', 'encryption', checked)}
                  />
                  <Label htmlFor="neo4jEncryption">Use encryption</Label>
                </div>

                <div>
                  <Label htmlFor="maxConnectionPoolSize">Max Connection Pool Size</Label>
                  <Input
                    id="maxConnectionPoolSize"
                    type="number"
                    value={data.neo4j?.maxConnectionPoolSize || 100}
                    onChange={(e) => updateNestedData('neo4j', 'maxConnectionPoolSize', parseInt(e.target.value) || 100)}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            )}

            {data.provider === 'arangodb' && (
              <div className="space-y-4">
                <h4 className="font-medium">ArangoDB Specific Settings</h4>
                <div>
                  <Label htmlFor="collectionType">Collection Type</Label>
                  <Select
                    value={data.arangodb?.collectionType || 'document'}
                    onValueChange={(value) => updateNestedData('arangodb', 'collectionType', value)}
                  >
                    <SelectTrigger id="collectionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document Collection</SelectItem>
                      <SelectItem value="edge">Edge Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="waitForSync"
                    checked={data.arangodb?.waitForSync ?? true}
                    onCheckedChange={(checked) => updateNestedData('arangodb', 'waitForSync', checked)}
                  />
                  <Label htmlFor="waitForSync">Wait for sync</Label>
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Graph data will be written when this workflow step executes.
                For large datasets, consider using batch processing and transactions.
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

export default GraphDBEditor;
