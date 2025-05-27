// imports/ui/pages/AgentWorkflow/workflow-components/data/s3/editor.jsx

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/components/ui';
import { Textarea } from 'ui/components/ui';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const S3Editor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [metadata, setMetadata] = useState(
    Object.entries(data.options?.metadata || {}).map(([key, value]) => ({ key, value }))
  );

  const handleSave = () => {
    // Convert metadata array back to object
    const metadataObj = {};
    metadata.forEach(item => {
      if (item.key) {
        metadataObj[item.key] = item.value;
      }
    });

    onSave({
      ...node,
      data: {
        ...data,
        options: {
          ...data.options,
          metadata: metadataObj
        }
      }
    });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateCredentials = (field, value) => {
    setData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));
  };

  const updateOptions = (field, value) => {
    setData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [field]: value
      }
    }));
  };

  const addMetadata = () => {
    setMetadata([...metadata, { key: '', value: '' }]);
  };

  const updateMetadata = (index, field, value) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  const removeMetadata = (index) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure S3 Storage</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="operation" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="operation">Operation</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="operation" className="space-y-4">
              <div>
                <Label htmlFor="operation">Operation</Label>
                <Select value={data.operation} onValueChange={(value) => updateData('operation', value)}>
                  <SelectTrigger id="operation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="get">Get Object</SelectItem>
                    <SelectItem value="put">Put Object</SelectItem>
                    <SelectItem value="delete">Delete Object</SelectItem>
                    <SelectItem value="list">List Objects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bucket">Bucket Name</Label>
                <Input
                  id="bucket"
                  value={data.bucket || ''}
                  onChange={(e) => updateData('bucket', e.target.value)}
                  placeholder="my-bucket-name"
                />
              </div>

              {(data.operation === 'get' || data.operation === 'put' || data.operation === 'delete') && (
                <div>
                  <Label htmlFor="key">Object Key</Label>
                  <Input
                    id="key"
                    value={data.key || ''}
                    onChange={(e) => updateData('key', e.target.value)}
                    placeholder="path/to/file.json"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The key (path) of the object in the bucket
                  </p>
                </div>
              )}

              {data.operation === 'get' && (
                <div>
                  <Label htmlFor="versionId">Version ID (Optional)</Label>
                  <Input
                    id="versionId"
                    value={data.options?.versionId || ''}
                    onChange={(e) => updateOptions('versionId', e.target.value)}
                    placeholder="Leave empty for latest version"
                  />
                </div>
              )}

              {data.operation === 'list' && (
                <>
                  <div>
                    <Label htmlFor="prefix">Prefix (Optional)</Label>
                    <Input
                      id="prefix"
                      value={data.options?.prefix || ''}
                      onChange={(e) => updateOptions('prefix', e.target.value)}
                      placeholder="folder/subfolder/"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxKeys">Max Keys</Label>
                    <Input
                      id="maxKeys"
                      type="number"
                      value={data.options?.maxKeys || 1000}
                      onChange={(e) => updateOptions('maxKeys', parseInt(e.target.value))}
                      min="1"
                      max="1000"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <div>
                <Label htmlFor="region">AWS Region</Label>
                <Select value={data.region} onValueChange={(value) => updateData('region', value)}>
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                    <SelectItem value="custom">Custom Endpoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.region === 'custom' && (
                <div>
                  <Label htmlFor="endpoint">Custom Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={data.endpoint || ''}
                    onChange={(e) => updateData('endpoint', e.target.value)}
                    placeholder="https://s3.custom-provider.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    For S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="accessKeyId">Access Key ID</Label>
                <Input
                  id="accessKeyId"
                  value={data.credentials?.accessKeyId || ''}
                  onChange={(e) => updateCredentials('accessKeyId', e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>

              <div>
                <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                <div className="relative">
                  <Input
                    id="secretAccessKey"
                    type={showSecretKey ? 'text' : 'password'}
                    value={data.credentials?.secretAccessKey || ''}
                    onChange={(e) => updateCredentials('secretAccessKey', e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              {data.operation === 'put' && (
                <>
                  <div>
                    <Label htmlFor="acl">Access Control List (ACL)</Label>
                    <Select value={data.options?.acl || 'private'} onValueChange={(value) => updateOptions('acl', value)}>
                      <SelectTrigger id="acl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public-read">Public Read</SelectItem>
                        <SelectItem value="public-read-write">Public Read/Write</SelectItem>
                        <SelectItem value="authenticated-read">Authenticated Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Input
                      id="contentType"
                      value={data.options?.contentType || 'auto'}
                      onChange={(e) => updateOptions('contentType', e.target.value)}
                      placeholder="application/json"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use "auto" to detect automatically
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Object Metadata</Label>
                    {metadata.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Key"
                          value={item.key}
                          onChange={(e) => updateMetadata(index, 'key', e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={item.value}
                          onChange={(e) => updateMetadata(index, 'value', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMetadata(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMetadata}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Metadata
                    </Button>
                  </div>
                </>
              )}

              {data.operation === 'list' && (
                <div>
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Input
                    id="delimiter"
                    value={data.options?.delimiter || '/'}
                    onChange={(e) => updateOptions('delimiter', e.target.value)}
                    placeholder="/"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Used to group keys (usually "/" for folder-like structure)
                  </p>
                </div>
              )}
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

export default S3Editor;
