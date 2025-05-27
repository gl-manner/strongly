// imports/ui/pages/AgentWorkflow/workflow-components/output/email/editor.jsx

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
import { Mail, AlertCircle, Server, Key } from 'lucide-react';

const EmailEditor = ({ node, onSave, onCancel, isOpen }) => {
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateData = (data) => {
    const errors = {};

    if (!data.from) {
      errors.from = 'From address is required';
    }

    if (!data.to) {
      errors.to = 'To address is required';
    }

    if (!data.subject) {
      errors.subject = 'Subject is required';
    }

    if (!data.body) {
      errors.body = 'Email body is required';
    }

    if (data.provider === 'smtp' && !data.useEnvCredentials) {
      if (!data.smtpHost) errors.smtpHost = 'SMTP host is required';
      if (!data.smtpUser) errors.smtpUser = 'SMTP user is required';
      if (!data.smtpPassword) errors.smtpPassword = 'SMTP password is required';
    }

    if (data.provider !== 'smtp' && !data.useEnvCredentials && !data.apiKey) {
      errors.apiKey = 'API key is required';
    }

    return errors;
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

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={20} />
            Configure Email Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <div>
              <Label htmlFor="provider">Email Provider</Label>
              <Select
                value={data.provider || 'smtp'}
                onValueChange={(value) => updateData('provider', value)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP Server</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="aws-ses">AWS SES</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useEnvCredentials"
                checked={data.useEnvCredentials ?? true}
                onCheckedChange={(checked) => updateData('useEnvCredentials', checked)}
              />
              <Label htmlFor="useEnvCredentials">Use environment variables for credentials</Label>
            </div>

            {data.provider === 'smtp' ? (
              <>
                {data.useEnvCredentials ? (
                  <div>
                    <Label htmlFor="envPrefix">Environment Variable Prefix</Label>
                    <Input
                      id="envPrefix"
                      value={data.envPrefix || 'EMAIL_'}
                      onChange={(e) => updateData('envPrefix', e.target.value)}
                      placeholder="EMAIL_"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Will use: {data.envPrefix}HOST, {data.envPrefix}PORT, {data.envPrefix}USER, {data.envPrefix}PASSWORD
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={data.smtpHost || ''}
                          onChange={(e) => updateData('smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                          className={errors.smtpHost ? 'border-red-500' : ''}
                        />
                        {errors.smtpHost && (
                          <p className="text-sm text-red-500 mt-1">{errors.smtpHost}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={data.smtpPort || 587}
                          onChange={(e) => updateData('smtpPort', parseInt(e.target.value) || 587)}
                          className={errors.smtpPort ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={data.smtpUser || ''}
                        onChange={(e) => updateData('smtpUser', e.target.value)}
                        className={errors.smtpUser ? 'border-red-500' : ''}
                      />
                      {errors.smtpUser && (
                        <p className="text-sm text-red-500 mt-1">{errors.smtpUser}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={data.smtpPassword || ''}
                        onChange={(e) => updateData('smtpPassword', e.target.value)}
                        className={errors.smtpPassword ? 'border-red-500' : ''}
                      />
                      {errors.smtpPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.smtpPassword}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtpSecure"
                        checked={data.smtpSecure || false}
                        onCheckedChange={(checked) => updateData('smtpSecure', checked)}
                      />
                      <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {data.useEnvCredentials ? (
                  <div>
                    <Label htmlFor="apiKeyEnvVar">API Key Environment Variable</Label>
                    <Input
                      id="apiKeyEnvVar"
                      value={data.apiKeyEnvVar || 'EMAIL_API_KEY'}
                      onChange={(e) => updateData('apiKeyEnvVar', e.target.value)}
                      placeholder="EMAIL_API_KEY"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={data.apiKey || ''}
                      onChange={(e) => updateData('apiKey', e.target.value)}
                      placeholder="Your API key"
                      className={errors.apiKey ? 'border-red-500' : ''}
                    />
                    {errors.apiKey && (
                      <p className="text-sm text-red-500 mt-1">{errors.apiKey}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From Address</Label>
                <Input
                  id="from"
                  type="email"
                  value={data.from || ''}
                  onChange={(e) => updateData('from', e.target.value)}
                  placeholder="sender@example.com"
                  className={errors.from ? 'border-red-500' : ''}
                />
                {errors.from && (
                  <p className="text-sm text-red-500 mt-1">{errors.from}</p>
                )}
              </div>
              <div>
                <Label htmlFor="fromName">From Name (Optional)</Label>
                <Input
                  id="fromName"
                  value={data.fromName || ''}
                  onChange={(e) => updateData('fromName', e.target.value)}
                  placeholder="Sender Name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="to">To Address(es)</Label>
              <Input
                id="to"
                value={data.to || ''}
                onChange={(e) => updateData('to', e.target.value)}
                placeholder="recipient@example.com or {{email}} for dynamic"
                className={errors.to ? 'border-red-500' : ''}
              />
              {errors.to && (
                <p className="text-sm text-red-500 mt-1">{errors.to}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use comma to separate multiple emails. Use {'{{field}}'} syntax for dynamic values.
              </p>
            </div>

            <div>
              <Label htmlFor="cc">CC (Optional)</Label>
              <Input
                id="cc"
                value={data.cc || ''}
                onChange={(e) => updateData('cc', e.target.value)}
                placeholder="cc@example.com"
              />
            </div>

            <div>
              <Label htmlFor="bcc">BCC (Optional)</Label>
              <Input
                id="bcc"
                value={data.bcc || ''}
                onChange={(e) => updateData('bcc', e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>

            <div>
              <Label htmlFor="replyTo">Reply-To (Optional)</Label>
              <Input
                id="replyTo"
                value={data.replyTo || ''}
                onChange={(e) => updateData('replyTo', e.target.value)}
                placeholder="reply@example.com"
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={data.subject || ''}
                onChange={(e) => updateData('subject', e.target.value)}
                placeholder="Email subject or use {{field}} for dynamic values"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bodyType">Body Type</Label>
              <Select
                value={data.bodyType || 'html'}
                onValueChange={(value) => updateData('bodyType', value)}
              >
                <SelectTrigger id="bodyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="both">Both HTML and Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={data.body || ''}
                onChange={(e) => updateData('body', e.target.value)}
                placeholder={data.bodyType === 'html' ?
                  '<h1>Hello {{name}}</h1><p>Your message here...</p>' :
                  'Hello {{name}},\n\nYour message here...'}
                rows={10}
                className={`font-mono text-sm ${errors.body ? 'border-red-500' : ''}`}
              />
              {errors.body && (
                <p className="text-sm text-red-500 mt-1">{errors.body}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use {'{{field}}'} to insert dynamic values from input data
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {(data.provider === 'sendgrid' || data.provider === 'mailgun') && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trackOpens"
                    checked={data.trackOpens || false}
                    onCheckedChange={(checked) => updateData('trackOpens', checked)}
                  />
                  <Label htmlFor="trackOpens">Track Email Opens</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="trackClicks"
                    checked={data.trackClicks || false}
                    onCheckedChange={(checked) => updateData('trackClicks', checked)}
                  />
                  <Label htmlFor="trackClicks">Track Link Clicks</Label>
                </div>
              </>
            )}

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

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Emails will be sent when this workflow step is executed.
                Test with a small dataset first to avoid sending unintended emails.
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

export default EmailEditor;
