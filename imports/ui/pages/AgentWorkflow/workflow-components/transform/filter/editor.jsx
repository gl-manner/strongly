// imports/ui/pages/AgentWorkflow/workflow-components/transform/filter/editor.jsx

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

const FilterEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [conditions, setConditions] = useState(data.conditions || []);

  const handleSave = () => {
    onSave({
      ...node,
      data: {
        ...data,
        conditions
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

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: '',
        operator: 'equals',
        value: '',
        caseSensitive: false
      }
    ]);
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater or Equal' },
    { value: 'less_equal', label: 'Less or Equal' },
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
    { value: 'regex', label: 'Matches Regex' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Filter</DialogTitle>
        </DialogHeader>

        <Tabs value={data.filterType} onValueChange={(value) => updateData('filterType', value)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="simple">Simple Filter</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filter</TabsTrigger>
            <TabsTrigger value="custom">Custom Function</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="simple" className="space-y-4">
              <div>
                <Label>Conditions</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Filter items based on field values
                </p>

                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <Input
                          placeholder="Field path"
                          value={condition.field}
                          onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        {!['is_empty', 'is_not_empty', 'is_null', 'is_not_null'].includes(condition.operator) && (
                          <Input
                            placeholder="Value"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          />
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Switch
                          checked={condition.caseSensitive}
                          onCheckedChange={(checked) => updateCondition(index, 'caseSensitive', checked)}
                        />
                        <Label className="ml-2 text-xs">Case</Label>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCondition(index)}
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
                  onClick={addCondition}
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              {conditions.length > 1 && (
                <div>
                  <Label htmlFor="logic">Condition Logic</Label>
                  <Select value={data.logic} onValueChange={(value) => updateData('logic', value)}>
                    <SelectTrigger id="logic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">All conditions must match (AND)</SelectItem>
                      <SelectItem value="or">Any condition must match (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-2">Advanced filter supports:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Nested object filtering with dot notation (e.g., user.profile.age)</li>
                    <li>Array element filtering (e.g., tags[0])</li>
                    <li>Complex logical expressions</li>
                  </ul>
                </div>

                <div>
                  <Label>Filter Expression</Label>
                  <Textarea
                    value={data.advancedExpression || ''}
                    onChange={(e) => updateData('advancedExpression', e.target.value)}
                    placeholder='Example: (user.age > 18 && user.status === "active") || user.role === "admin"'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label>Custom Filter Function</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Write JavaScript code that returns true to keep an item, false to filter it out
                </p>
                <Textarea
                  value={data.customFunction || ''}
                  onChange={(e) => updateData('customFunction', e.target.value)}
                  placeholder={'// Available variables: item, index, array\n// Example:\nreturn item.age > 18 && item.status === "active";'}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="keepEmpty"
              checked={data.options?.keepEmpty ?? false}
              onCheckedChange={(checked) => updateOptions('keepEmpty', checked)}
            />
            <Label htmlFor="keepEmpty">Keep empty values (null, undefined, empty strings)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="deepFilter"
              checked={data.options?.deepFilter ?? false}
              onCheckedChange={(checked) => updateOptions('deepFilter', checked)}
            />
            <Label htmlFor="deepFilter">Apply filter to nested arrays/objects</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="returnFirst"
              checked={data.options?.returnFirst ?? false}
              onCheckedChange={(checked) => updateOptions('returnFirst', checked)}
            />
            <Label htmlFor="returnFirst">Return only the first matching item</Label>
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

export default FilterEditor;
