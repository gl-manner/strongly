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
import { Switch } from '/imports/ui/components/ui';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const FormEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addField = () => {
    const newField = { name: '', type: 'text', required: false };
    updateData('fields', [...(data.fields || []), newField]);
  };

  const updateField = (index, field, value) => {
    const fields = [...(data.fields || [])];
    fields[index] = { ...fields[index], [field]: value };
    updateData('fields', fields);
  };

  const removeField = (index) => {
    const fields = [...(data.fields || [])];
    fields.splice(index, 1);
    updateData('fields', fields);
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'file', label: 'File Upload' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Form Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="formName">Form Name</Label>
            <Input
              id="formName"
              value={data.formName}
              onChange={(e) => updateData('formName', e.target.value)}
              placeholder="Contact Form"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Form Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
              >
                <Plus size={16} className="mr-1" />
                Add Field
              </Button>
            </div>

            <div className="space-y-2">
              {(data.fields || []).map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <GripVertical size={16} className="text-muted-foreground cursor-move" />

                  <Input
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    placeholder="Field name"
                    className="flex-1"
                  />

                  <Select
                    value={field.type}
                    onValueChange={(v) => updateField(index, 'type', v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(index, 'required', checked)}
                    />
                    <span className="text-sm">Required</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="submitButton">Submit Button Text</Label>
            <Input
              id="submitButton"
              value={data.submitButton}
              onChange={(e) => updateData('submitButton', e.target.value)}
              placeholder="Submit"
            />
          </div>

          <div>
            <Label htmlFor="successMessage">Success Message</Label>
            <Input
              id="successMessage"
              value={data.successMessage}
              onChange={(e) => updateData('successMessage', e.target.value)}
              placeholder="Thank you for your submission!"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requireAuth">Require Authentication</Label>
            <Switch
              id="requireAuth"
              checked={data.requireAuth}
              onCheckedChange={(checked) => updateData('requireAuth', checked)}
            />
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

export default FormEditor;
