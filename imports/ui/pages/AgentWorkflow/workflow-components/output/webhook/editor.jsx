// imports/ui/pages/AgentWorkflow/workflow-components/output/webhook/editor.jsx

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
import { Globe, AlertCircle, Key, Shield, Clock, Zap } from 'lucide-react';

const WebhookEditor = ({ node, onSave, onCancel, isOpen }) => {
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

    if (!data.url) {
      errors.url = 'Webhook URL is required';
    } else if (!isValidUrl(data.url)) {
      errors.url = 'Please enter a valid URL';
    }

    if (data.authType === 'bearer' && !data.bearerToken) {
      errors.bearerToken = 'Bearer token is required';
    }

    if (data.authType === 'basic' && (!data.username || !data.password)) {
      if (!data.username) errors.username = 'Username is required for basic auth';
      if (!data.password) errors.password = 'Password is required for basic auth';
    }

    if (data.authType === 'apiKey' && (!data.apiKeyHeader || !data.apiKeyValue)) {
      if (!data.apiKeyHeader) errors.apiKeyHeader = 'API key header name is required';
      if (!data.apiKeyValue) errors.apiKeyValue = 'API key value is required';
    }

    return errors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const testWebhook = async () => {
    const validationErrors = validateData(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // In a real implementation, this would send a test request to the webhook
      setTimeout(() => {
        setTestResult({
          success: true,
          message: 'Webhook test successful',
          details: {
            status: 200,
            responseTime: '243ms',
            headers: {
              'Content-Type': 'application/json',
              'X-Request-Id': 'test-123456'
            }
          }
        });
        setIsTesting(false);
      }, 1500);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Webhook test failed',
        error: error.message
      });
      setIsTesting(false);
    }
  };

  const handleAddHeader = () => {
    const currentHeaders = data.headers || {};
    updateData('headers', { ...currentHeaders, '': '' });
  };

  const handleHeaderChange = (oldKey, newKey, value) => {
    const newHeaders = { ...data.headers };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    if (newKey) {
      newHeaders[newKey] = value;
    }
    updateData('headers', newHeaders);
  };

  const handleRemoveHeader = (key) => {
    const newHeaders = { ...data.headers };
    delete newHeaders[key];
    updateData('headers', newHeaders);
  };

  const getPayloadTemplate = () => {
    switch (data.payloadFormat) {
      case 'custom':
        return '{\n  "event": "data_processed",\n  "timestamp": "{{timestamp}}",\n  "data": {{input}}\n}';
      case 'slack':
        return '{\n  "text": "New data processed",\n  "attachments": [\n    {\n      "color": "good",\n      "fields": {{fields}}\n    }\n  ]\n}';
      case 'discord':
        return '{\n  "content": "Data Update",\n  "embeds": [\n    {\n      "title": "{{title}}",\n      "description": "{{description}}",\n      "color": 5814783\n    }\n  ]\n}';
      case 'teams':
        return '{\n  "@type": "MessageCard",\n  "@context": "http://schema.org/extensions",\n  "summary": "{{summary}}",\n  "sections": [{{sections}}]\n}';
      default:
        return '{{input}}';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={20} />
            Configure Webhook Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="endpoint" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoint" className="space-y-4">
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                value={data.url || ''}
                onChange={(e) => updateData('url', e.target.value)}
                placeholder="https://api.example.com/webhook"
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && (
                <p className="text-sm text-red-500 mt-1">{errors.url}</p>
              )}
            </div>

            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={data.method || 'POST'}
                onValueChange={(value) => updateData('method', value)}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={data.contentType || 'application/json'}
                onValueChange={(value) => updateData('contentType', value)}
              >
                <SelectTrigger id="contentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">application/json</SelectItem>
                  <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                  <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                  <SelectItem value="application/xml">application/xml</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant="outline"
                onClick={testWebhook}
                disabled={isTesting}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Webhook'}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <strong>{testResult.message}</strong>
                  {testResult.details && (
                    <div className="mt-2 text-sm">
                      <div>Status: {testResult.details.status}</div>
                      <div>Response Time: {testResult.details.responseTime}</div>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="mt-2 text-sm">{testResult.error}</div>
                  )}
                </div>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <div>
              <Label htmlFor="authType">Authentication Type</Label>
              <Select
                value={data.authType || 'none'}
                onValueChange={(value) => updateData('authType', value)}
              >
                <SelectTrigger id="authType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Authentication</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Authentication</SelectItem>
                  <SelectItem value="apiKey">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.authType === 'bearer' && (
              <div>
                <Label htmlFor="bearerToken">Bearer Token</Label>
                <Input
                  id="bearerToken"
                  type="password"
                  value={data.bearerToken || ''}
                  onChange={(e) => updateData('bearerToken', e.target.value)}
                  placeholder="Enter bearer token"
                  className={errors.bearerToken ? 'border-red-500' : ''}
                />
                {errors.bearerToken && (
                  <p className="text-sm text-red-500 mt-1">{errors.bearerToken}</p>
                )}
              </div>
            )}

            {data.authType === 'basic' && (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={data.username || ''}
                    onChange={(e) => updateData('username', e.target.value)}
                    placeholder="Enter username"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password || ''}
                    onChange={(e) => updateData('password', e.target.value)}
                    placeholder="Enter password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
              </>
            )}

            {data.authType === 'apiKey' && (
              <>
                <div>
                  <Label htmlFor="apiKeyLocation">API Key Location</Label>
                  <Select
                    value={data.apiKeyLocation || 'header'}
                    onValueChange={(value) => updateData('apiKeyLocation', value)}
                  >
                    <SelectTrigger id="apiKeyLocation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="query">Query Parameter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiKeyHeader">
                    {data.apiKeyLocation === 'query' ? 'Parameter Name' : 'Header Name'}
                  </Label>
                  <Input
                    id="apiKeyHeader"
                    value={data.apiKeyHeader || ''}
                    onChange={(e) => updateData('apiKeyHeader', e.target.value)}
                    placeholder={data.apiKeyLocation === 'query' ? 'api_key' : 'X-API-Key'}
                    className={errors.apiKeyHeader ? 'border-red-500' : ''}
                  />
                  {errors.apiKeyHeader && (
                    <p className="text-sm text-red-500 mt-1">{errors.apiKeyHeader}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="apiKeyValue">API Key Value</Label>
                  <Input
                    id="apiKeyValue"
                    type="password"
                    value={data.apiKeyValue || ''}
                    onChange={(e) => updateData('apiKeyValue', e.target.value)}
                    placeholder="Enter API key"
                    className={errors.apiKeyValue ? 'border-red-500' : ''}
                  />
                  {errors.apiKeyValue && (
                    <p className="text-sm text-red-500 mt-1">{errors.apiKeyValue}</p>
                  )}
                </div>
              </>
            )}

            {data.authType === 'oauth2' && (
              <Alert>
                <Key className="h-4 w-4" />
                <div>
                  OAuth 2.0 configuration requires additional setup.
                  Please configure your OAuth credentials in the workflow settings.
                </div>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="payload" className="space-y-4">
            <div>
              <Label htmlFor="payloadFormat">Payload Format</Label>
              <Select
                value={data.payloadFormat || 'raw'}
                onValueChange={(value) => updateData('payloadFormat', value)}
              >
                <SelectTrigger id="payloadFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">Raw Input Data</SelectItem>
                  <SelectItem value="custom">Custom Template</SelectItem>
                  <SelectItem value="slack">Slack Format</SelectItem>
                  <SelectItem value="discord">Discord Format</SelectItem>
                  <SelectItem value="teams">Microsoft Teams Format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payloadTemplate">Payload Template</Label>
              <Textarea
                id="payloadTemplate"
                value={data.payloadTemplate || getPayloadTemplate()}
                onChange={(e) => updateData('payloadTemplate', e.target.value)}
                placeholder="Enter payload template"
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{{input}}'} for the entire input data, {'{{field}}'} for specific fields,
                {'{{timestamp}}'} for current timestamp
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="includeMetadata"
                checked={data.includeMetadata ?? true}
                onCheckedChange={(checked) => updateData('includeMetadata', checked)}
              />
              <Label htmlFor="includeMetadata">Include workflow metadata</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="compressPayload"
                checked={data.compressPayload || false}
                onCheckedChange={(checked) => updateData('compressPayload', checked)}
              />
              <Label htmlFor="compressPayload">Compress payload (gzip)</Label>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>Custom Headers</Label>
              <div className="space-y-2">
                {Object.entries(data.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={key}
                      onChange={(e) => handleHeaderChange(key, e.target.value, value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header value"
                      value={value}
                      onChange={(e) => handleHeaderChange(key, key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveHeader(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddHeader}
                >
                  Add Header
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout || 30}
                  onChange={(e) => updateData('timeout', parseInt(e.target.value) || 30)}
                  min="1"
                  max="300"
                />
              </div>

              <div>
                <Label htmlFor="retryCount">Retry Count</Label>
                <Input
                  id="retryCount"
                  type="number"
                  value={data.retryCount || 3}
                  onChange={(e) => updateData('retryCount', parseInt(e.target.value) || 3)}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="retryDelay">Retry Delay (seconds)</Label>
              <Input
                id="retryDelay"
                type="number"
                value={data.retryDelay || 1}
                onChange={(e) => updateData('retryDelay', parseInt(e.target.value) || 1)}
                min="1"
                max="60"
              />
            </div>

            <div>
              <Label htmlFor="successCodes">Success Status Codes</Label>
              <Input
                id="successCodes"
                value={data.successCodes || '200,201,202,204'}
                onChange={(e) => updateData('successCodes', e.target.value)}
                placeholder="200,201,202,204"
              />
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated list of HTTP status codes to treat as success
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="followRedirects"
                checked={data.followRedirects ?? true}
                onCheckedChange={(checked) => updateData('followRedirects', checked)}
              />
              <Label htmlFor="followRedirects">Follow redirects</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="validateSSL"
                checked={data.validateSSL ?? true}
                onCheckedChange={(checked) => updateData('validateSSL', checked)}
              />
              <Label htmlFor="validateSSL">Validate SSL certificates</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="logResponses"
                checked={data.logResponses || false}
                onCheckedChange={(checked) => updateData('logResponses', checked)}
              />
              <Label htmlFor="logResponses">Log webhook responses</Label>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Webhook will be called when this workflow step executes.
                Failed requests will be retried according to your settings.
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

export default WebhookEditor;
