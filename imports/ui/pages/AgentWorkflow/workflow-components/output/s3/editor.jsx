// imports/ui/pages/AgentWorkflow/workflow-components/output/s3/editor.jsx

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
import { Cloud, AlertCircle, Key, Upload, Settings, Shield } from 'lucide-react';

const S3OutputEditor = ({ node, onSave, onCancel, isOpen }) => {
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

    if (!data.bucketName) {
      errors.bucketName = 'Bucket name is required';
    }

    if (!data.objectKey) {
      errors.objectKey = 'Object key is required';
    }

    if (!data.useEnvCredentials && (!data.accessKeyId || !data.secretAccessKey)) {
      if (!data.accessKeyId) errors.accessKeyId = 'Access Key ID is required';
      if (!data.secretAccessKey) errors.secretAccessKey = 'Secret Access Key is required';
    }

    if (data.useEnvCredentials && !data.envPrefix) {
      errors.envPrefix = 'Environment variable prefix is required';
    }

    if (data.serverSideEncryption === 'aws:kms' && !data.kmsKeyId) {
      errors.kmsKeyId = 'KMS Key ID is required for KMS encryption';
    }

    return errors;
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // In a real implementation, this would test S3 access
      setTimeout(() => {
        setTestResult({
          success: true,
          message: 'S3 connection successful',
          details: {
            bucket: data.bucketName,
            region: data.region,
            accessible: true,
            versioning: 'Enabled',
            encryption: 'AES256'
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

  const handleAddMetadata = () => {
    const currentMetadata = data.metadata || {};
    updateData('metadata', { ...currentMetadata, '': '' });
  };

  const handleMetadataChange = (oldKey, newKey, value) => {
    const newMetadata = { ...data.metadata };
    if (oldKey !== newKey) {
      delete newMetadata[oldKey];
    }
    if (newKey) {
      newMetadata[newKey] = value;
    }
    updateData('metadata', newMetadata);
  };

  const handleRemoveMetadata = (key) => {
    const newMetadata = { ...data.metadata };
    delete newMetadata[key];
    updateData('metadata', newMetadata);
  };

  const handleAddTag = () => {
    const currentTags = data.tags || {};
    updateData('tags', { ...currentTags, '': '' });
  };

  const handleTagChange = (oldKey, newKey, value) => {
    const newTags = { ...data.tags };
    if (oldKey !== newKey) {
      delete newTags[oldKey];
    }
    if (newKey) {
      newTags[newKey] = value;
    }
    updateData('tags', newTags);
  };

  const handleRemoveTag = (key) => {
    const newTags = { ...data.tags };
    delete newTags[key];
    updateData('tags', newTags);
  };

  const getObjectKeyPlaceholder = () => {
    const examples = [
      'data/{{year}}/{{month}}/{{day}}/output.json',
      'exports/{{timestamp}}/data.csv',
      'uploads/{{userId}}/{{filename}}',
      'backups/{{date}}/{{database}}.sql'
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud size={20} />
            Configure S3 Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="storage" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="data">Data Format</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="storage" className="space-y-4">
            <div>
              <Label htmlFor="bucketName">Bucket Name</Label>
              <Input
                id="bucketName"
                value={data.bucketName || ''}
                onChange={(e) => updateData('bucketName', e.target.value)}
                placeholder="my-bucket-name"
                className={errors.bucketName ? 'border-red-500' : ''}
              />
              {errors.bucketName && (
                <p className="text-sm text-red-500 mt-1">{errors.bucketName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="objectKey">Object Key (Path)</Label>
              <Input
                id="objectKey"
                value={data.objectKey || ''}
                onChange={(e) => updateData('objectKey', e.target.value)}
                placeholder={getObjectKeyPlaceholder()}
                className={errors.objectKey ? 'border-red-500' : ''}
              />
              {errors.objectKey && (
                <p className="text-sm text-red-500 mt-1">{errors.objectKey}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use {'{{timestamp}}'}, {'{{date}}'}, {'{{year}}'}, {'{{month}}'}, {'{{day}}'} for dynamic paths
              </p>
            </div>

            <div>
              <Label htmlFor="region">AWS Region</Label>
              <Select
                value={data.region || 'us-east-1'}
                onValueChange={(value) => updateData('region', value)}
              >
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endpoint">Custom Endpoint (S3-compatible)</Label>
              <Input
                id="endpoint"
                value={data.endpoint || ''}
                onChange={(e) => updateData('endpoint', e.target.value)}
                placeholder="https://s3-compatible.example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: For S3-compatible services like MinIO, Wasabi, etc.
              </p>
            </div>

            <div>
              <Label htmlFor="storageClass">Storage Class</Label>
              <Select
                value={data.storageClass || 'STANDARD'}
                onValueChange={(value) => updateData('storageClass', value)}
              >
                <SelectTrigger id="storageClass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="STANDARD_IA">Standard-IA (Infrequent Access)</SelectItem>
                  <SelectItem value="ONEZONE_IA">One Zone-IA</SelectItem>
                  <SelectItem value="INTELLIGENT_TIERING">Intelligent-Tiering</SelectItem>
                  <SelectItem value="GLACIER">Glacier Flexible Retrieval</SelectItem>
                  <SelectItem value="GLACIER_IR">Glacier Instant Retrieval</SelectItem>
                  <SelectItem value="DEEP_ARCHIVE">Glacier Deep Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useEnvCredentials"
                checked={data.useEnvCredentials ?? true}
                onCheckedChange={(checked) => updateData('useEnvCredentials', checked)}
              />
              <Label htmlFor="useEnvCredentials">Use environment variables for credentials</Label>
            </div>

            {data.useEnvCredentials ? (
              <div>
                <Label htmlFor="envPrefix">Environment Variable Prefix</Label>
                <Input
                  id="envPrefix"
                  value={data.envPrefix || 'AWS_'}
                  onChange={(e) => updateData('envPrefix', e.target.value)}
                  placeholder="AWS_"
                  className={errors.envPrefix ? 'border-red-500' : ''}
                />
                {errors.envPrefix && (
                  <p className="text-sm text-red-500 mt-1">{errors.envPrefix}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Will use: {data.envPrefix}ACCESS_KEY_ID, {data.envPrefix}SECRET_ACCESS_KEY
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="accessKeyId">Access Key ID</Label>
                  <Input
                    id="accessKeyId"
                    value={data.accessKeyId || ''}
                    onChange={(e) => updateData('accessKeyId', e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className={errors.accessKeyId ? 'border-red-500' : ''}
                  />
                  {errors.accessKeyId && (
                    <p className="text-sm text-red-500 mt-1">{errors.accessKeyId}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    value={data.secretAccessKey || ''}
                    onChange={(e) => updateData('secretAccessKey', e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className={errors.secretAccessKey ? 'border-red-500' : ''}
                  />
                  {errors.secretAccessKey && (
                    <p className="text-sm text-red-500 mt-1">{errors.secretAccessKey}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTesting}
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test S3 Access'}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <strong>{testResult.message}</strong>
                  {testResult.details && (
                    <div className="mt-2 text-sm">
                      <div>Bucket: {testResult.details.bucket}</div>
                      <div>Region: {testResult.details.region}</div>
                      <div>Versioning: {testResult.details.versioning}</div>
                      <div>Default Encryption: {testResult.details.encryption}</div>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="mt-2 text-sm">{testResult.error}</div>
                  )}
                </div>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div>
              <Label htmlFor="dataFormat">Data Format</Label>
              <Select
                value={data.dataFormat || 'json'}
                onValueChange={(value) => updateData('dataFormat', value)}
              >
                <SelectTrigger id="dataFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="binary">Binary/Raw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Input
                id="contentType"
                value={data.contentType || 'application/json'}
                onChange={(e) => updateData('contentType', e.target.value)}
                placeholder="application/json"
              />
              <p className="text-sm text-gray-500 mt-1">
                MIME type for the uploaded file
              </p>
            </div>

            {data.dataFormat === 'json' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="jsonPretty"
                  checked={data.jsonPretty ?? true}
                  onCheckedChange={(checked) => updateData('jsonPretty', checked)}
                />
                <Label htmlFor="jsonPretty">Pretty print JSON</Label>
              </div>
            )}

            {data.dataFormat === 'csv' && (
              <>
                <div>
                  <Label htmlFor="csvDelimiter">CSV Delimiter</Label>
                  <Input
                    id="csvDelimiter"
                    value={data.csvDelimiter || ','}
                    onChange={(e) => updateData('csvDelimiter', e.target.value)}
                    placeholder=","
                    maxLength="1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="csvHeaders"
                    checked={data.csvHeaders ?? true}
                    onCheckedChange={(checked) => updateData('csvHeaders', checked)}
                  />
                  <Label htmlFor="csvHeaders">Include headers row</Label>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="compression">Compression</Label>
              <Select
                value={data.compression || 'none'}
                onValueChange={(value) => updateData('compression', value)}
              >
                <SelectTrigger id="compression">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Compression</SelectItem>
                  <SelectItem value="gzip">Gzip (.gz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentEncoding">Content Encoding</Label>
              <Input
                id="contentEncoding"
                value={data.contentEncoding || ''}
                onChange={(e) => updateData('contentEncoding', e.target.value)}
                placeholder="gzip (if compressed)"
              />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div>
              <Label htmlFor="acl">Access Control List (ACL)</Label>
              <Select
                value={data.acl || 'private'}
                onValueChange={(value) => updateData('acl', value)}
              >
                <SelectTrigger id="acl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public-read">Public Read</SelectItem>
                  <SelectItem value="public-read-write">Public Read/Write</SelectItem>
                  <SelectItem value="authenticated-read">Authenticated Read</SelectItem>
                  <SelectItem value="bucket-owner-read">Bucket Owner Read</SelectItem>
                  <SelectItem value="bucket-owner-full-control">Bucket Owner Full Control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serverSideEncryption">Server-Side Encryption</Label>
              <Select
                value={data.serverSideEncryption || 'none'}
                onValueChange={(value) => updateData('serverSideEncryption', value)}
              >
                <SelectTrigger id="serverSideEncryption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="AES256">AES256 (S3-Managed Keys)</SelectItem>
                  <SelectItem value="aws:kms">AWS KMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.serverSideEncryption === 'aws:kms' && (
              <div>
                <Label htmlFor="kmsKeyId">KMS Key ID</Label>
                <Input
                  id="kmsKeyId"
                  value={data.kmsKeyId || ''}
                  onChange={(e) => updateData('kmsKeyId', e.target.value)}
                  placeholder="arn:aws:kms:region:account-id:key/key-id"
                  className={errors.kmsKeyId ? 'border-red-500' : ''}
                />
                {errors.kmsKeyId && (
                  <p className="text-sm text-red-500 mt-1">{errors.kmsKeyId}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="cacheControl">Cache Control</Label>
              <Input
                id="cacheControl"
                value={data.cacheControl || ''}
                onChange={(e) => updateData('cacheControl', e.target.value)}
                placeholder="max-age=3600"
              />
              <p className="text-sm text-gray-500 mt-1">
                HTTP Cache-Control header for the object
              </p>
            </div>

            <div>
              <Label>Object Metadata</Label>
              <div className="space-y-2">
                {Object.entries(data.metadata || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      placeholder="Metadata key"
                      value={key}
                      onChange={(e) => handleMetadataChange(key, e.target.value, value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Metadata value"
                      value={value}
                      onChange={(e) => handleMetadataChange(key, key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMetadata(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddMetadata}
                >
                  Add Metadata
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Custom metadata to attach to the S3 object
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>Object Tags</Label>
              <div className="space-y-2">
                {Object.entries(data.tags || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      placeholder="Tag key"
                      value={key}
                      onChange={(e) => handleTagChange(key, e.target.value, value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Tag value"
                      value={value}
                      onChange={(e) => handleTagChange(key, key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTag(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  Add Tag
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Tags for cost allocation and organization
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partSize">Multipart Upload Part Size (bytes)</Label>
                <Input
                  id="partSize"
                  type="number"
                  value={data.partSize || 5242880}
                  onChange={(e) => updateData('partSize', parseInt(e.target.value) || 5242880)}
                  min="5242880"
                  max="104857600"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Min: 5MB, Max: 100MB
                </p>
              </div>

              <div>
                <Label htmlFor="queueSize">Upload Queue Size</Label>
                <Input
                  id="queueSize"
                  type="number"
                  value={data.queueSize || 4}
                  onChange={(e) => updateData('queueSize', parseInt(e.target.value) || 4)}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeout">Upload Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout || 60000}
                  onChange={(e) => updateData('timeout', parseInt(e.target.value) || 60000)}
                  min="10000"
                  max="600000"
                  step="1000"
                />
              </div>

              <div>
                <Label htmlFor="retries">Retry Attempts</Label>
                <Input
                  id="retries"
                  type="number"
                  value={data.retries || 3}
                  onChange={(e) => updateData('retries', parseInt(e.target.value) || 3)}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="versioningEnabled"
                checked={data.versioningEnabled || false}
                onCheckedChange={(checked) => updateData('versioningEnabled', checked)}
              />
              <Label htmlFor="versioningEnabled">Enable versioning</Label>
            </div>

            {data.versioningEnabled && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="deleteOldVersions"
                    checked={data.deleteOldVersions || false}
                    onCheckedChange={(checked) => updateData('deleteOldVersions', checked)}
                  />
                  <Label htmlFor="deleteOldVersions">Delete old versions</Label>
                </div>

                {data.deleteOldVersions && (
                  <div>
                    <Label htmlFor="maxVersions">Max Versions to Keep</Label>
                    <Input
                      id="maxVersions"
                      type="number"
                      value={data.maxVersions || 10}
                      onChange={(e) => updateData('maxVersions', parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                    />
                  </div>
                )}
              </>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Data will be uploaded to S3 when this workflow step executes.
                Large files will automatically use multipart upload for better reliability.
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

export default S3OutputEditor;
