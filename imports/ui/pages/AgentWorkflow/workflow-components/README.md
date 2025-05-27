# Workflow Components Guide

## Overview

This guide explains how to add new components to the workflow builder. Components are modular pieces that can be connected together to create workflows.

## Component Categories

- **triggers** - Start a workflow (webhook, schedule, form submission, etc.)
- **data** - Fetch or read data (database, API, file, etc.)
- **transform** - Process or transform data (filter, map, code, etc.)
- **ai** - AI/ML operations (GPT, vision, classification, etc.)
- **output** - Send data somewhere (email, webhook, database, etc.)

## Adding a New Component

### Step 1: Create Component Directory

Create the directory structure:
```
workflow-components/
└── category/
    └── your-component-name/
        ├── index.js         (required - whitelist file)
        ├── metadata.js      (required)
        ├── icon.jsx         (required)
        ├── editor.jsx       (required)
        ├── schema.js        (optional)
        └── executor.js      (optional)
```

### Step 2: Create the Whitelist File (index.js)

Create `index.js` in your component directory to whitelist files for Meteor's dynamic import:

```javascript
// imports/ui/pages/AgentWorkflow/workflow-components/category/your-component-name/index.js

// This file contains the static imports for your component
// It ensures Meteor includes these files in the bundle for dynamic import

// Whitelist for dynamic imports - this tells Meteor to include these files
if (false) {
  import('./metadata.js');
  import('./icon.jsx');
  import('./editor.jsx');
  import('./schema.js');    // Only if you have this file
  import('./executor.js');  // Only if you have this file
}
```

### Step 3: Update Main Index File

Edit `imports/ui/pages/AgentWorkflow/workflow-components/index.js`:

1. Add the import for your component's index.js:
```javascript
// Import all component index files
// ... existing imports ...
import './category/your-component-name/index.js';  // Add this line
```

2. Add your component to the `COMPONENTS_TO_SCAN` array:
```javascript
const COMPONENTS_TO_SCAN = [
  // ... existing components ...
  'category/your-component-name',  // Add this line
];
```

### Step 4: Create Required Files

#### metadata.js (Required)
Defines all component properties and behavior:

```javascript
export default {
  // Display Information
  label: 'Your Component',              // Display name in sidebar
  description: 'What this component does', // Tooltip/description
  color: '#4CAF50',                     // Node color in workflow canvas

  // Default Configuration
  defaultData: {
    // Default values for component settings
    setting1: 'default value',
    setting2: true,
    setting3: 100
  },

  // Connection Rules
  allowedInputs: ['*'],     // What can connect TO this component
                           // ['*'] = anything
                           // ['data', 'transform'] = only these categories
                           // ['data/api', 'transform/filter'] = specific types
                           // [] = nothing (e.g., triggers)

  allowedOutputs: ['*'],    // What this component can connect TO
                           // Same rules as allowedInputs

  maxInputs: -1,           // Max number of input connections (-1 = unlimited)
  maxOutputs: -1,          // Max number of output connections (-1 = unlimited)

  // Additional Metadata
  version: '1.0.0',        // Component version
  author: 'Your Name',     // Component author
  tags: ['tag1', 'tag2'],  // Searchable tags

  // Behavior Flags
  isAsync: false,          // Does this component run asynchronously?
  requiresAuth: false,     // Does this component need authentication?
  isBeta: false,          // Show beta badge?
};
```

#### icon.jsx (Required)
React component that renders an SVG icon:

```javascript
import React from 'react';

const YourComponentIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Your SVG paths here */}
    <path
      d="M12 2L12 22M2 12L22 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default YourComponentIcon;
```

#### editor.jsx (Required)
React component for the configuration modal:

```javascript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const YourComponentEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {node.label || 'Component'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add your form fields here */}
          <div>
            <Label htmlFor="setting1">Setting 1</Label>
            <Input
              id="setting1"
              value={data.setting1 || ''}
              onChange={(e) => updateData('setting1', e.target.value)}
              placeholder="Enter value"
            />
          </div>

          {/* Add more fields as needed */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YourComponentEditor;
```

#### schema.js (Optional)
JSON Schema for validating component configuration:

```javascript
export default {
  type: 'object',
  properties: {
    setting1: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    setting2: {
      type: 'boolean',
      default: true
    },
    setting3: {
      type: 'number',
      minimum: 0,
      maximum: 1000
    }
  },
  required: ['setting1'] // Required fields
};
```

#### executor.js (Optional)
Server-side execution logic:

```javascript
export default async function executeComponent(context) {
  const { node, input, services } = context;

  // Access component configuration
  const { setting1, setting2 } = node.data;

  // Process the input
  const result = await processData(input, setting1, setting2);

  // Return output for next component
  return {
    success: true,
    data: result,
    metadata: {
      processedAt: new Date(),
      recordCount: result.length
    }
  };
}
```

## Connection Rules Examples

### Trigger Component (No Inputs)
```javascript
allowedInputs: [],        // Triggers don't accept inputs
allowedOutputs: ['*'],    // Can connect to anything
maxInputs: 0,            // No inputs allowed
maxOutputs: -1,          // Unlimited outputs
```

### Processing Component
```javascript
allowedInputs: ['triggers', 'data', 'transform'], // Accept from these categories
allowedOutputs: ['transform', 'ai', 'output'],    // Can connect to these
maxInputs: -1,                                    // Unlimited inputs
maxOutputs: -1,                                   // Unlimited outputs
```

### Output Component (Terminal)
```javascript
allowedInputs: ['*'],     // Accept from anything
allowedOutputs: [],       // Terminal node - no outputs
maxInputs: 1,            // Only one input
maxOutputs: 0,           // No outputs allowed
```

### Specific Component Restrictions
```javascript
// Only accept from specific component types
allowedInputs: ['data/database', 'data/api', 'transform/filter'],

// Only allow connection to specific components
allowedOutputs: ['output/email', 'output/slack'],
```

## Component Best Practices

1. **Naming Convention**
   - Use lowercase with hyphens: `my-component-name`
   - Be descriptive: `send-email` not just `email`

2. **Icons**
   - Use 24x24 viewBox for consistency
   - Support size and color props
   - Keep icons simple and recognizable

3. **Editor Forms**
   - Validate input on change when possible
   - Provide helpful placeholders and labels
   - Group related settings
   - Use appropriate input types (number, select, etc.)

4. **Default Data**
   - Provide sensible defaults
   - Ensure component works with defaults
   - Document what each field does

5. **Error Handling**
   - Handle missing or invalid configuration gracefully
   - Provide clear error messages
   - Don't crash the workflow

## Testing Your Component

1. **Create all required files** including the index.js whitelist
2. **Add import and path** to main index.js file
3. **Refresh the app** - component should appear in sidebar
4. **Drag to canvas** - should create a node with correct color/icon
5. **Double-click node** - should open editor modal
6. **Test connections** - verify connection rules work
7. **Save and reload** - ensure configuration persists

## Troubleshooting

### Component doesn't appear in sidebar
- Check that import is added to main index.js
- Check that path is added to `COMPONENTS_TO_SCAN`
- Verify all required files exist (index.js, metadata.js, icon.jsx, editor.jsx)
- Check browser console for loading errors
- Ensure metadata.js exports a valid object

### Can't connect components
- Review `allowedInputs` and `allowedOutputs` in metadata
- Check `maxInputs` and `maxOutputs` limits
- Verify category names match exactly

### Editor modal issues
- Ensure `onSave` is called with updated node data
- Check that `data` state is properly initialized
- Verify Dialog component is properly imported

### Dynamic import errors
- Make sure the component's index.js file has the whitelist
- Verify all imported files in the whitelist actually exist
- Check that the `if (false)` block is present in index.js

## Examples

See existing components for reference:
- `triggers/webhook` - Basic trigger with configuration
- `transform/filter` - Data processing with conditions  
- `ai/gpt` - Complex configuration with multiple options
- `output/email` - Output component with validation

## Need Help?

- Check existing components for patterns
- Review the component loader in main index.js
- Ensure your component follows the standard structure
- Test incrementally - add basic files first, then enhance
- Look at browser console for specific error messages
