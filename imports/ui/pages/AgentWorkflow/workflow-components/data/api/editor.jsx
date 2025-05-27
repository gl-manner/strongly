// imports/ui/pages/AgentWorkflow/workflow-components/data/api/editor.jsx

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/imports/ui/components/ui';
import { Textarea } from '/imports/ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '/imports/ui/components/ui';
import { Plus, Trash2 } from 'lucide-react';

const ApiEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [headers, setHeaders] = useState(
    Object.entries(data.headers || {}).map(([key, value]) => ({ key, value }))
  );

  const handleSave = () => {
    // Convert headers array back to object
    const headersObj = {};
    headers.forEach(header => {
      if (header.key) {
        headersObj[header.key] = header.value;
      }
    });

    onSave({
      ...node,
      data: {
        ...data,
        headers: headersObj
      }
    });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateAuth = (field, value) => {
    setData(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [field]: value
      }
    }));
  };

  const updateAuthCredentials = (field, value) => {
    setData(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        credentials: {
          ...prev.authentication.credentials,
          [field]: value
        }
      }
    }));
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure API Request</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="request" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="request" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select value={data.method} onValueChange={(value) => updateData('method', value)}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={data.url || ''}
                    onChange={(e) => updateData('url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              </div>

              {['POST', 'PUT', 'PATCH'].includes(data.method) && (
                <div>
                  <Label htmlFor="body">Request Body</Label>
                  <Textarea
                    id="body"
                    value={data.body || ''}
                    onChange={(e) => updateData('body', e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="headers" className="space-y-4">
              <div className="space-y-2">
                <Label>HTTP Headers</Label>
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeHeader(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHeader}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <div>
                <Label htmlFor="authType">Authentication Type</Label>
                <Select
                  value={data.authentication?.type || 'none'}
                  onValueChange={(value) => updateAuth('type', value)}
                >
                  <SelectTrigger id="authType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apiKey">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.authentication?.type === 'basic' && (
                <>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={data.authentication?.credentials?.username || ''}
                      onChange={(e) => updateAuthCredentials('username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.authentication?.credentials?.password || ''}
                      onChange={(e) => updateAuthCredentials('password', e.target.value)}
                    />
                  </div>
                </>
              )}

              {data.authentication?.type === 'bearer' && (
                <div>
                  <Label htmlFor="token">Bearer Token</Label>
                  <Input
                    id="token"
                    value={data.authentication?.credentials?.token || ''}
                    onChange={(e) => updateAuthCredentials('token', e.target.value)}
                    placeholder="Your bearer token"
                  />
                </div>
              )}

              {data.authentication?.type === 'apiKey' && (
                <>
                  <div>
                    <Label htmlFor="apiKeyName">API Key Header Name</Label>
                    <Input
                      id="apiKeyName"
                      value={data.authentication?.credentials?.headerName || 'X-API-Key'}
                      onChange={(e) => updateAuthCredentials('headerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKeyValue">API Key Value</Label>
                    <Input
                      id="apiKeyValue"
                      value={data.authentication?.credentials?.apiKey || ''}
                      onChange={(e) => updateAuthCredentials('apiKey', e.target.value)}
                      placeholder="Your API key"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout || 30000}
                  onChange={(e) => updateData('timeout', parseInt(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <Label htmlFor="retries">Retry Count</Label>
                <Input
                  id="retries"
                  type="number"
                  value={data.retries || 0}
                  onChange={(e) => updateData('retries', parseInt(e.target.value))}
                  min="0"
                  max="5"
                />
              </div>

              <div>
                <Label htmlFor="responseType">Response Type</Label>
                <Select
                  value={data.responseType || 'json'}
                  onValueChange={(value) => updateData('responseType', value)}
                >
                  <SelectTrigger id="responseType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="blob">Binary (Blob)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiEditor;
