// imports/ui/pages/AgentWorkflow/workflow-components/data/storage/editor.jsx

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
import { Textarea } from 'ui/components/ui';
import { Switch } from 'ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/components/ui';

const StorageEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (field, value) => {
    setData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Key-Value Storage</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="operation" className="mt-4">
          <TabsList>
            <TabsTrigger value="operation">Operation</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="operation" className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation</Label>
              <Select value={data.operation} onValueChange={(value) => updateData('operation', value)}>
                <SelectTrigger id="operation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="get">Get Value</SelectItem>
                  <SelectItem value="set">Set Value</SelectItem>
                  <SelectItem value="delete">Delete Key</SelectItem>
                  <SelectItem value="list">List Keys</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="namespace">Namespace</Label>
              <Input
                id="namespace"
                value={data.namespace || 'default'}
                onChange={(e) => updateData('namespace', e.target.value)}
                placeholder="default"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Group related keys in namespaces
              </p>
            </div>

            {(data.operation === 'get' || data.operation === 'set' || data.operation === 'delete') && (
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={data.key || ''}
                  onChange={(e) => updateData('key', e.target.value)}
                  placeholder="my-key-name"
                />
              </div>
            )}

            {data.operation === 'set' && (
              <>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Textarea
                    id="value"
                    value={data.value || ''}
                    onChange={(e) => updateData('value', e.target.value)}
                    placeholder="Enter the value to store (can be JSON)"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JSON objects, arrays, or simple values
                  </p>
                </div>

                <div>
                  <Label htmlFor="ttl">TTL (seconds)</Label>
                  <Input
                    id="ttl"
                    type="number"
                    value={data.ttl || ''}
                    onChange={(e) => updateData('ttl', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Leave empty for no expiration"
                    min="1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Time to live - key will expire after this many seconds
                  </p>
                </div>
              </>
            )}

            {data.operation === 'list' && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  List operation will return all keys in the namespace.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use with caution in namespaces with many keys.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {data.operation === 'get' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="createIfNotExists"
                  checked={data.options?.createIfNotExists ?? true}
                  onCheckedChange={(checked) => updateOption('createIfNotExists', checked)}
                />
                <Label htmlFor="createIfNotExists">
                  Return default value if key doesn't exist
                </Label>
              </div>
            )}

            {data.operation === 'set' && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="overwrite"
                    checked={data.options?.overwrite ?? true}
                    onCheckedChange={(checked) => updateOption('overwrite', checked)}
                  />
                  <Label htmlFor="overwrite">
                    Overwrite if key already exists
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="returnPrevious"
                    checked={data.options?.returnPrevious ?? false}
                    onCheckedChange={(checked) => updateOption('returnPrevious', checked)}
                  />
                  <Label htmlFor="returnPrevious">
                    Return previous value after setting
                  </Label>
                </div>
              </>
            )}

            {data.operation === 'delete' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="returnPrevious"
                  checked={data.options?.returnPrevious ?? false}
                  onCheckedChange={(checked) => updateOption('returnPrevious', checked)}
                />
                <Label htmlFor="returnPrevious">
                  Return value before deletion
                </Label>
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

export default StorageEditor;
