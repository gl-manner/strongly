// imports/ui/pages/AgentWorkflow/workflow-components/transform/merge/editor.jsx

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
import { Switch } from 'ui/components/ui';
import { Plus, Trash2 } from 'lucide-react';

const MergeEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [keyMappings, setKeyMappings] = useState(
    Object.entries(data.keyMapping || {}).map(([key, value]) => ({ inputIndex: key, outputKey: value }))
  );

  const handleSave = () => {
    // Convert key mappings array back to object
    const keyMapping = {};
    keyMappings.forEach(mapping => {
      if (mapping.inputIndex && mapping.outputKey) {
        keyMapping[mapping.inputIndex] = mapping.outputKey;
      }
    });

    onSave({
      ...node,
      data: {
        ...data,
        keyMapping
      }
    });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateJoinOptions = (field, value) => {
    setData(prev => ({
      ...prev,
      joinOptions: {
        ...prev.joinOptions,
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

  const addKeyMapping = () => {
    setKeyMappings([...keyMappings, { inputIndex: '', outputKey: '' }]);
  };

  const updateKeyMapping = (index, field, value) => {
    const newMappings = [...keyMappings];
    newMappings[index][field] = value;
    setKeyMappings(newMappings);
  };

  const removeKeyMapping = (index) => {
    setKeyMappings(keyMappings.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Merge</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="merge" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="merge">Merge Settings</TabsTrigger>
            <TabsTrigger value="mapping">Input Mapping</TabsTrigger>
            <TabsTrigger value="custom">Custom Function</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="merge" className="space-y-4">
              <div>
                <Label htmlFor="mergeType">Merge Type</Label>
                <Select value={data.mergeType} onValueChange={(value) => updateData('mergeType', value)}>
                  <SelectTrigger id="mergeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="object">Merge Objects</SelectItem>
                    <SelectItem value="array">Merge Arrays</SelectItem>
                    <SelectItem value="concat">Concatenate Arrays</SelectItem>
                    <SelectItem value="join">Join Strings</SelectItem>
                    <SelectItem value="custom">Custom Merge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.mergeType === 'object' && (
                <div>
                  <Label htmlFor="mergeStrategy">Merge Strategy</Label>
                  <Select value={data.mergeStrategy} onValueChange={(value) => updateData('mergeStrategy', value)}>
                    <SelectTrigger id="mergeStrategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shallow">Shallow Merge (Last wins)</SelectItem>
                      <SelectItem value="deep">Deep Merge (Recursive)</SelectItem>
                      <SelectItem value="replace">Replace (No merge)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How to handle overlapping properties
                  </p>
                </div>
              )}

              {(data.mergeType === 'array' || data.mergeType === 'concat') && (
                <div>
                  <Label htmlFor="arrayHandling">Array Handling</Label>
                  <Select value={data.arrayHandling} onValueChange={(value) => updateData('arrayHandling', value)}>
                    <SelectTrigger id="arrayHandling">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concat">Concatenate All</SelectItem>
                      <SelectItem value="merge">Merge by Index</SelectItem>
                      <SelectItem value="replace">Replace Arrays</SelectItem>
                      <SelectItem value="unique">Unique Values Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {data.mergeType === 'join' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="separator">Separator</Label>
                    <Input
                      id="separator"
                      value={data.joinOptions?.separator || ', '}
                      onChange={(e) => updateJoinOptions('separator', e.target.value)}
                      placeholder=", "
                    />
                  </div>
                  <div>
                    <Label htmlFor="prefix">Prefix</Label>
                    <Input
                      id="prefix"
                      value={data.joinOptions?.prefix || ''}
                      onChange={(e) => updateJoinOptions('prefix', e.target.value)}
                      placeholder="Optional prefix"
                    />
                  </div>
                  <div>
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                      id="suffix"
                      value={data.joinOptions?.suffix || ''}
                      onChange={(e) => updateJoinOptions('suffix', e.target.value)}
                      placeholder="Optional suffix"
                    />
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="skipNull"
                    checked={data.options?.skipNull ?? true}
                    onCheckedChange={(checked) => updateOptions('skipNull', checked)}
                  />
                  <Label htmlFor="skipNull">Skip null/undefined values</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="skipEmpty"
                    checked={data.options?.skipEmpty ?? true}
                    onCheckedChange={(checked) => updateOptions('skipEmpty', checked)}
                  />
                  <Label htmlFor="skipEmpty">Skip empty arrays/objects</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="removeDuplicates"
                    checked={data.options?.removeDuplicates ?? false}
                    onCheckedChange={(checked) => updateOptions('removeDuplicates', checked)}
                  />
                  <Label htmlFor="removeDuplicates">Remove duplicate values (arrays only)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserveArrayOrder"
                    checked={data.options?.preserveArrayOrder ?? true}
                    onCheckedChange={(checked) => updateOptions('preserveArrayOrder', checked)}
                  />
                  <Label htmlFor="preserveArrayOrder">Preserve array order</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <div>
                <Label>Input to Key Mapping</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Map input connections to specific object keys (for object merge)
                </p>

                <div className="space-y-3">
                  {keyMappings.map((mapping, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Input index (0, 1, 2...)"
                        value={mapping.inputIndex}
                        onChange={(e) => updateKeyMapping(index, 'inputIndex', e.target.value)}
                      />
                      <Input
                        placeholder="Output key name"
                        value={mapping.outputKey}
                        onChange={(e) => updateKeyMapping(index, 'outputKey', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeKeyMapping(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKeyMapping}
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key Mapping
                </Button>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <p className="text-sm text-muted-foreground">
                    Input 0 → "userData"<br />
                    Input 1 → "orderData"<br />
                    Result: {`{ userData: {...}, orderData: {...} }`}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label>Custom Merge Function</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Write JavaScript code to merge inputs in a custom way
                </p>
                <Textarea
                  value={data.customFunction || ''}
                  onChange={(e) => updateData('customFunction', e.target.value)}
                  placeholder={`// Available variables: inputs (array of all inputs)
// Example 1: Merge all objects
return inputs.reduce((acc, input) => ({ ...acc, ...input }), {});

// Example 2: Custom array merge
return inputs.flat().filter((v, i, a) => a.indexOf(v) === i);

// Example 3: Conditional merge
return inputs.map((input, index) => ({
  source: index,
  data: input,
  timestamp: new Date()
}));`}
                  rows={12}
                  className="font-mono text-sm"
                />
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

export default MergeEditor;
