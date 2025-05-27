// imports/ui/pages/AgentWorkflow/workflow-components/data/file/editor.jsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '/imports/ui/components/ui';
import { Switch } from '/imports/ui/components/ui';
import { FileUp } from 'lucide-react';

const FileEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleSave = () => {
    onSave({
      ...node,
      data: {
        ...data,
        uploadedFile
      }
    });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateParseOptions = (format, field, value) => {
    setData(prev => ({
      ...prev,
      parseOptions: {
        ...prev.parseOptions,
        [format]: {
          ...prev.parseOptions?.[format],
          [field]: value
        }
      }
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure File Reader</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="source" className="mt-4">
          <TabsList>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="parsing">Parsing Options</TabsTrigger>
          </TabsList>

          <TabsContent value="source" className="space-y-4">
            <div>
              <Label htmlFor="source">File Source</Label>
              <Select value={data.source} onValueChange={(value) => updateData('source', value)}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upload">Upload File</SelectItem>
                  <SelectItem value="path">File Path</SelectItem>
                  <SelectItem value="url">File URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.source === 'upload' && (
              <div>
                <Label htmlFor="file">Upload File</Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {uploadedFile && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Selected: {uploadedFile.name}</p>
                      <p>Size: {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.source === 'path' && (
              <div>
                <Label htmlFor="filePath">File Path</Label>
                <Input
                  id="filePath"
                  value={data.filePath || ''}
                  onChange={(e) => updateData('filePath', e.target.value)}
                  placeholder="/path/to/file.csv"
                />
              </div>
            )}

            {data.source === 'url' && (
              <div>
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  value={data.fileUrl || ''}
                  onChange={(e) => updateData('fileUrl', e.target.value)}
                  placeholder="https://example.com/data.json"
                />
              </div>
            )}

            <div>
              <Label htmlFor="fileType">File Type</Label>
              <Select value={data.fileType} onValueChange={(value) => updateData('fileType', value)}>
                <SelectTrigger id="fileType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="encoding">Encoding</Label>
              <Select value={data.encoding} onValueChange={(value) => updateData('encoding', value)}>
                <SelectTrigger id="encoding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utf-8">UTF-8</SelectItem>
                  <SelectItem value="utf-16">UTF-16</SelectItem>
                  <SelectItem value="ascii">ASCII</SelectItem>
                  <SelectItem value="latin1">Latin-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="parsing" className="space-y-4">
            {(data.fileType === 'csv' || data.fileType === 'auto') && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">CSV Options</h4>

                <div>
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Input
                    id="delimiter"
                    value={data.parseOptions?.csv?.delimiter || ','}
                    onChange={(e) => updateParseOptions('csv', 'delimiter', e.target.value)}
                    placeholder=","
                    maxLength={1}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasHeaders"
                    checked={data.parseOptions?.csv?.hasHeaders ?? true}
                    onChange={(e) => updateParseOptions('csv', 'hasHeaders', e.target.checked)}
                  />
                  <Label htmlFor="hasHeaders">First row contains headers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="skipEmptyLines"
                    checked={data.parseOptions?.csv?.skipEmptyLines ?? true}
                    onChange={(e) => updateParseOptions('csv', 'skipEmptyLines', e.target.checked)}
                  />
                  <Label htmlFor="skipEmptyLines">Skip empty lines</Label>
                </div>
              </div>
            )}

            {(data.fileType === 'json' || data.fileType === 'auto') && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">JSON Options</h4>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="strict"
                    checked={data.parseOptions?.json?.strict ?? false}
                    onChange={(e) => updateParseOptions('json', 'strict', e.target.checked)}
                  />
                  <Label htmlFor="strict">Strict parsing mode</Label>
                </div>
              </div>
            )}
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

export default FileEditor;
