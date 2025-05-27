// imports/ui/pages/AgentWorkflow/workflow-components/output/file/editor.jsx

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
import { FileText, AlertCircle, FolderOpen, Upload, Settings } from 'lucide-react';

const FileOutputEditor = ({ node, onSave, onCancel, isOpen }) => {
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

    if (!data.filePath && data.fileType === 'local') {
      errors.filePath = 'File path is required for local files';
    }

    if (!data.fileName) {
      errors.fileName = 'File name is required';
    }

    if (data.fileType === 'ftp' || data.fileType === 'sftp') {
      if (!data.ftpHost) errors.ftpHost = 'FTP host is required';
      if (!data.ftpUser) errors.ftpUser = 'FTP username is required';
      if (data.fileType === 'ftp' && !data.ftpPassword) {
        errors.ftpPassword = 'FTP password is required';
      }
      if (data.fileType === 'sftp' && !data.ftpPassword && !data.sftpPrivateKey) {
        errors.ftpPassword = 'Password or private key is required for SFTP';
      }
    }

    if (data.fileFormat === 'csv' && !data.csvDelimiter) {
      errors.csvDelimiter = 'CSV delimiter is required';
    }

    return errors;
  };

  const getDataTemplatePlaceholder = () => {
    switch (data.fileFormat) {
      case 'json':
        return '{{input}} or custom JSON template';
      case 'csv':
        return '{{input}} - data should be an array of objects';
      case 'xml':
        return '<root>\n  <item>{{field}}</item>\n</root>';
      case 'txt':
        return '{{input}} or custom text with {{field}} placeholders';
      default:
        return '{{input}}';
    }
  };

  const getLineTemplatePlaceholder = () => {
    switch (data.fileFormat) {
      case 'csv':
        return '{{field1}},{{field2}},{{field3}}';
      case 'txt':
        return '{{name}}: {{value}}';
      default:
        return '{{input}}';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Configure File Output
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="file">File Settings</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div>
              <Label htmlFor="fileType">File Type</Label>
              <Select
                value={data.fileType || 'local'}
                onValueChange={(value) => updateData('fileType', value)}
              >
                <SelectTrigger id="fileType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local File System</SelectItem>
                  <SelectItem value="ftp">FTP Server</SelectItem>
                  <SelectItem value="sftp">SFTP Server</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.fileType === 'local' && (
              <div>
                <Label htmlFor="filePath" className="flex items-center gap-2">
                  <FolderOpen size={16} />
                  File Path
                </Label>
                <Input
                  id="filePath"
                  value={data.filePath || ''}
                  onChange={(e) => updateData('filePath', e.target.value)}
                  placeholder="/path/to/output/directory"
                  className={errors.filePath ? 'border-red-500' : ''}
                />
                {errors.filePath && (
                  <p className="text-sm text-red-500 mt-1">{errors.filePath}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Directory where the file will be saved
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={data.fileName || ''}
                onChange={(e) => updateData('fileName', e.target.value)}
                placeholder="output-{{timestamp}}.json"
                className={errors.fileName ? 'border-red-500' : ''}
              />
              {errors.fileName && (
                <p className="text-sm text-red-500 mt-1">{errors.fileName}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use {'{{timestamp}}'} for current timestamp, {'{{date}}'} for date
              </p>
            </div>

            <div>
              <Label htmlFor="writeMode">Write Mode</Label>
              <Select
                value={data.writeMode || 'overwrite'}
                onValueChange={(value) => updateData('writeMode', value)}
              >
                <SelectTrigger id="writeMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overwrite">Overwrite if exists</SelectItem>
                  <SelectItem value="append">Append to existing file</SelectItem>
                  <SelectItem value="create">Create new (fail if exists)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="createDirectories"
                checked={data.createDirectories ?? true}
                onCheckedChange={(checked) => updateData('createDirectories', checked)}
              />
              <Label htmlFor="createDirectories">Create directories if they don't exist</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="timestamp"
                checked={data.timestamp ?? true}
                onCheckedChange={(checked) => updateData('timestamp', checked)}
              />
              <Label htmlFor="timestamp">Add timestamp to filename automatically</Label>
            </div>
          </TabsContent>

          <TabsContent value="format" className="space-y-4">
            <div>
              <Label htmlFor="fileFormat">File Format</Label>
              <Select
                value={data.fileFormat || 'json'}
                onValueChange={(value) => updateData('fileFormat', value)}
              >
                <SelectTrigger id="fileFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="encoding">File Encoding</Label>
              <Select
                value={data.encoding || 'utf8'}
                onValueChange={(value) => updateData('encoding', value)}
              >
                <SelectTrigger id="encoding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utf8">UTF-8</SelectItem>
                  <SelectItem value="utf16le">UTF-16 LE</SelectItem>
                  <SelectItem value="latin1">Latin-1</SelectItem>
                  <SelectItem value="ascii">ASCII</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.fileFormat === 'json' && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="jsonPretty"
                    checked={data.jsonPretty ?? true}
                    onCheckedChange={(checked) => updateData('jsonPretty', checked)}
                  />
                  <Label htmlFor="jsonPretty">Pretty print JSON</Label>
                </div>

                {data.jsonPretty && (
                  <div>
                    <Label htmlFor="jsonSpacing">Indentation Spaces</Label>
                    <Input
                      id="jsonSpacing"
                      type="number"
                      value={data.jsonSpacing || 2}
                      onChange={(e) => updateData('jsonSpacing', parseInt(e.target.value) || 2)}
                      min="0"
                      max="8"
                    />
                  </div>
                )}
              </>
            )}

            {data.fileFormat === 'csv' && (
              <>
                <div>
                  <Label htmlFor="csvDelimiter">CSV Delimiter</Label>
                  <Input
                    id="csvDelimiter"
                    value={data.csvDelimiter || ','}
                    onChange={(e) => updateData('csvDelimiter', e.target.value)}
                    placeholder=","
                    maxLength="1"
                    className={errors.csvDelimiter ? 'border-red-500' : ''}
                  />
                  {errors.csvDelimiter && (
                    <p className="text-sm text-red-500 mt-1">{errors.csvDelimiter}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="csvHeaders"
                    checked={data.csvHeaders ?? true}
                    onCheckedChange={(checked) => updateData('csvHeaders', checked)}
                  />
                  <Label htmlFor="csvHeaders">Include headers row</Label>
                </div>

                <div>
                  <Label htmlFor="csvQuote">Quote Character</Label>
                  <Input
                    id="csvQuote"
                    value={data.csvQuote || '"'}
                    onChange={(e) => updateData('csvQuote', e.target.value)}
                    placeholder='"'
                    maxLength="1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="dataTemplate">Data Template</Label>
              <Textarea
                id="dataTemplate"
                value={data.dataTemplate || '{{input}}'}
                onChange={(e) => updateData('dataTemplate', e.target.value)}
                placeholder={getDataTemplatePlaceholder()}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Template for the entire file content. Use {'{{input}}'} for all data.
              </p>
            </div>

            {(data.fileFormat === 'csv' || data.fileFormat === 'txt') && (
              <div>
                <Label htmlFor="lineTemplate">Line Template (Optional)</Label>
                <Textarea
                  id="lineTemplate"
                  value={data.lineTemplate || ''}
                  onChange={(e) => updateData('lineTemplate', e.target.value)}
                  placeholder={getLineTemplatePlaceholder()}
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Template for each line/row. Leave empty to use default formatting.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            {(data.fileType === 'ftp' || data.fileType === 'sftp') && (
              <>
                <div>
                  <Label htmlFor="ftpHost">Host</Label>
                  <Input
                    id="ftpHost"
                    value={data.ftpHost || ''}
                    onChange={(e) => updateData('ftpHost', e.target.value)}
                    placeholder="ftp.example.com"
                    className={errors.ftpHost ? 'border-red-500' : ''}
                  />
                  {errors.ftpHost && (
                    <p className="text-sm text-red-500 mt-1">{errors.ftpHost}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ftpPort">Port</Label>
                    <Input
                      id="ftpPort"
                      type="number"
                      value={data.ftpPort || (data.fileType === 'sftp' ? 22 : 21)}
                      onChange={(e) => updateData('ftpPort', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ftpUser">Username</Label>
                    <Input
                      id="ftpUser"
                      value={data.ftpUser || ''}
                      onChange={(e) => updateData('ftpUser', e.target.value)}
                      className={errors.ftpUser ? 'border-red-500' : ''}
                    />
                    {errors.ftpUser && (
                      <p className="text-sm text-red-500 mt-1">{errors.ftpUser}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ftpPassword">Password</Label>
                  <Input
                    id="ftpPassword"
                    type="password"
                    value={data.ftpPassword || ''}
                    onChange={(e) => updateData('ftpPassword', e.target.value)}
                    className={errors.ftpPassword ? 'border-red-500' : ''}
                  />
                  {errors.ftpPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.ftpPassword}</p>
                  )}
                </div>

                {data.fileType === 'sftp' && (
                  <div>
                    <Label htmlFor="sftpPrivateKey">Private Key (Optional)</Label>
                    <Textarea
                      id="sftpPrivateKey"
                      value={data.sftpPrivateKey || ''}
                      onChange={(e) => updateData('sftpPrivateKey', e.target.value)}
                      placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Private key for SFTP authentication (alternative to password)
                    </p>
                  </div>
                )}

                {data.fileType === 'ftp' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ftpSecure"
                      checked={data.ftpSecure || false}
                      onCheckedChange={(checked) => updateData('ftpSecure', checked)}
                    />
                    <Label htmlFor="ftpSecure">Use FTPS (FTP over TLS)</Label>
                  </div>
                )}

                <div>
                  <Label htmlFor="filePath">Remote Directory</Label>
                  <Input
                    id="filePath"
                    value={data.filePath || ''}
                    onChange={(e) => updateData('filePath', e.target.value)}
                    placeholder="/path/to/remote/directory"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
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
                  <SelectItem value="zip">Zip (.zip)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.fileType === 'local' && (
              <div>
                <Label htmlFor="filePermissions">File Permissions (Unix)</Label>
                <Input
                  id="filePermissions"
                  value={data.filePermissions || '644'}
                  onChange={(e) => updateData('filePermissions', e.target.value)}
                  placeholder="644"
                  maxLength="3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Unix file permissions (e.g., 644 for rw-r--r--)
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                value={data.batchSize || 1000}
                onChange={(e) => updateData('batchSize', parseInt(e.target.value) || 1000)}
                min="1"
                max="100000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of records to write at once (for large datasets)
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                Files will be written when this workflow step executes.
                For large datasets, consider using batch processing and compression.
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

export default FileOutputEditor;
