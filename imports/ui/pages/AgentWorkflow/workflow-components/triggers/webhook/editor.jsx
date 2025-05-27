// imports/ui/pages/AgentWorkflow/workflow-components/triggers/webhook/editor.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '/imports/ui/components/ui';

import './webhook.scss';

const WebhookEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {
    method: 'POST',
    path: '/webhook',
    authentication: 'none',
    responseCode: 200,
    responseBody: '{"success": true}',
    headers: {},
    apiKeyHeader: 'X-API-Key',
    hmacSecret: ''
  });

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel} className="webhook-editor">
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Webhook Trigger</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="method">HTTP Method</Label>
                <select
                  id="method"
                  value={data.method}
                  onChange={(e) => updateData('method', e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="form-group">
                <Label htmlFor="path">Webhook Path</Label>
                <Input
                  id="path"
                  value={data.path || ''}
                  onChange={(e) => updateData('path', e.target.value)}
                  placeholder="/webhook/my-endpoint"
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="headers">Custom Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={JSON.stringify(data.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateData('headers', headers);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"X-Custom-Header": "value"}'
                className="font-mono"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <div className="form-group">
              <Label htmlFor="authentication">Authentication Type</Label>
              <select
                id="authentication"
                value={data.authentication}
                onChange={(e) => updateData('authentication', e.target.value)}
              >
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="api-key">API Key</option>
                <option value="hmac">HMAC Signature</option>
              </select>
            </div>

            {data.authentication === 'api-key' && (
              <div className="form-group">
                <Label htmlFor="apiKeyHeader">API Key Header Name</Label>
                <Input
                  id="apiKeyHeader"
                  value={data.apiKeyHeader || 'X-API-Key'}
                  onChange={(e) => updateData('apiKeyHeader', e.target.value)}
                />
              </div>
            )}

            {data.authentication === 'hmac' && (
              <div className="form-group">
                <Label htmlFor="hmacSecret">HMAC Secret</Label>
                <Input
                  id="hmacSecret"
                  type="password"
                  value={data.hmacSecret || ''}
                  onChange={(e) => updateData('hmacSecret', e.target.value)}
                  placeholder="Your secret key"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <div className="form-group">
              <Label htmlFor="responseCode">Response Status Code</Label>
              <Input
                id="responseCode"
                type="number"
                value={data.responseCode || 200}
                onChange={(e) => updateData('responseCode', parseInt(e.target.value) || 200)}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="responseBody">Response Body</Label>
              <Textarea
                id="responseBody"
                value={data.responseBody || ''}
                onChange={(e) => updateData('responseBody', e.target.value)}
                placeholder='{"success": true}'
                className="font-mono"
                rows={6}
              />
            </div>
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
