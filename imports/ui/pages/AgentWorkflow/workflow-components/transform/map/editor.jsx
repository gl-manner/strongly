// imports/ui/pages/AgentWorkflow/workflow-components/transform/map/editor.jsx

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
import { Plus, Trash2, ArrowRight } from 'lucide-react';

const MapEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [fieldMappings, setFieldMappings] = useState(data.fieldMappings || []);
  const [templateString, setTemplateString] = useState(
    JSON.stringify(data.template || {}, null, 2)
  );

  const handleSave = () => {
    // Parse template if in template mode
    let template = data.template;
    if (data.mapType === 'template') {
      try {
        template = JSON.parse(templateString);
      } catch (error) {
        // Keep existing template if parse fails
      }
    }

    onSave({
      ...node,
      data: {
        ...data,
        template,
        fieldMappings
      }
    });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
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

  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      {
        source: '',
        target: '',
        transform: 'none',
        defaultValue: ''
      }
    ]);
  };

  const updateFieldMapping = (index, field, value) => {
    const newMappings = [...fieldMappings];
    newMappings[index][field] = value;
    setFieldMappings(newMappings);
  };

  const removeFieldMapping = (index) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const transforms = [
    { value: 'none', label: 'No Transform' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
    { value: 'trim', label: 'Trim Whitespace' },
    { value: 'number', label: 'To Number' },
    { value: 'boolean', label: 'To Boolean' },
    { value: 'string', label: 'To String' },
    { value: 'date', label: 'To Date' },
    { value: 'json', label: 'Parse JSON' },
    { value: 'stringify', label: 'Stringify' },
    { value: 'base64', label: 'Base64 Encode' },
    { value: 'base64decode', label: 'Base64 Decode' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Map Transform</DialogTitle>
        </DialogHeader>

        <Tabs value={data.mapType} onValueChange={(value) => updateData('mapType', value)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="template">Template Mapping</TabsTrigger>
            <TabsTrigger value="fields">Field Mapping</TabsTrigger>
            <TabsTrigger value="custom">Custom Function</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="template" className="space-y-4">
              <div>
                <Label>Output Template</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Define the output structure using {`{{fieldName}}`} placeholders
                </p>
                <Textarea
                  value={templateString}
                  onChange={(e) => setTemplateString(e.target.value)}
                  placeholder={`{
  "id": "{{id}}",
  "fullName": "{{firstName}} {{lastName}}",
  "email": "{{contact.email}}",
  "status": "active"
}`}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Template Features:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Use {`{{field}}`} for simple field access</li>
                  <li>Use {`{{nested.field}}`} for nested objects</li>
                  <li>Use {`{{array[0]}}`} for array access</li>
                  <li>Combine multiple fields: {`{{firstName}} {{lastName}}`}</li>
                  <li>Add static values directly in the template</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div>
                <Label>Field Mappings</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Map source fields to target fields with optional transformations
                </p>

                <div className="space-y-3">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <Input
                          placeholder="Source field"
                          value={mapping.source}
                          onChange={(e) => updateFieldMapping(index, 'source', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Target field"
                          value={mapping.target}
                          onChange={(e) => updateFieldMapping(index, 'target', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={mapping.transform}
                          onValueChange={(value) => updateFieldMapping(index, 'transform', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {transforms.map(t => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Default"
                          value={mapping.defaultValue}
                          onChange={(e) => updateFieldMapping(index, 'defaultValue', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFieldMapping(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFieldMapping}
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Mapping
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label>Custom Transform Function</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Write JavaScript code to transform each item
                </p>
                <Textarea
                  value={data.customFunction || ''}
                  onChange={(e) => updateData('customFunction', e.target.value)}
                  placeholder={`// Available variables: item, index, array
// Example:
return {
  id: item.id,
  fullName: \`\${item.firstName} \${item.lastName}\`,
  email: item.contact?.email || 'no-email@example.com',
  processedAt: new Date().toISOString(),
  index: index
};`}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="skipNull"
              checked={data.options?.skipNull ?? true}
              onCheckedChange={(checked) => updateOptions('skipNull', checked)}
            />
            <Label htmlFor="skipNull">Skip null/undefined values in output</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="flattenResult"
              checked={data.options?.flattenResult ?? false}
              onCheckedChange={(checked) => updateOptions('flattenResult', checked)}
            />
            <Label htmlFor="flattenResult">Flatten nested arrays in result</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="preserveOriginal"
              checked={data.options?.preserveOriginal ?? false}
              onCheckedChange={(checked) => updateOptions('preserveOriginal', checked)}
            />
            <Label htmlFor="preserveOriginal">Preserve original fields not in mapping</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapEditor;
