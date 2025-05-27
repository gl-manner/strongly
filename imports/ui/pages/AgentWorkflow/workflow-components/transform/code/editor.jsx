// imports/ui/pages/AgentWorkflow/workflow-components/transform/code/editor.jsx

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
import { AlertCircle, Play } from 'lucide-react';
import { Alert } from 'ui/components/ui';

const CodeEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [testInput, setTestInput] = useState('{"test": "data"}');
  const [testOutput, setTestOutput] = useState('');
  const [testError, setTestError] = useState('');

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateLibraries = (library, enabled) => {
    setData(prev => ({
      ...prev,
      libraries: {
        ...prev.libraries,
        [library]: enabled
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

  const testCode = () => {
    setTestOutput('');
    setTestError('');

    try {
      // Parse test input
      let input;
      try {
        input = JSON.parse(testInput);
      } catch {
        input = testInput; // Use as string if not valid JSON
      }

      // Create a safe context for code execution
      const context = {
        workflow: { id: 'test', name: 'Test Workflow' },
        node: { id: 'test', type: 'code' },
        execution: { id: 'test', timestamp: new Date() }
      };

      // Build available globals
      const globals = ['input', 'context', 'console', 'JSON', 'Math', 'Date', 'Array', 'Object'];
      const globalValues = [input, context, console, JSON, Math, Date, Array, Object];

      // Add libraries if enabled
      if (data.libraries?.lodash) {
        globals.push('_');
        globalValues.push('lodash'); // Would need actual lodash instance
      }

      // Create and execute function
      const func = new Function(...globals, data.code);
      const result = func(...globalValues);

      setTestOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestError(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Custom Code Transform</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="code" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="code">Code Editor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="code" className="space-y-4">
              <div>
                <Label>Transform Code</Label>
                <Textarea
                  value={data.code || ''}
                  onChange={(e) => updateData('code', e.target.value)}
                  placeholder="// Write your transformation code here"
                  rows={20}
                  className="font-mono text-sm"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <strong>Available in your code:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><code>input</code> - The data from previous nodes</li>
                    <li><code>context</code> - Workflow execution context</li>
                    <li><code>console</code> - For logging (visible in test output)</li>
                    <li>Standard JS: <code>JSON</code>, <code>Math</code>, <code>Date</code>, <code>Array</code>, <code>Object</code></li>
                    <li>Must return a value using <code>return</code> statement</li>
                  </ul>
                </div>
              </Alert>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <Label htmlFor="timeout">Execution Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout || 5000}
                  onChange={(e) => updateData('timeout', parseInt(e.target.value))}
                  min="100"
                  max="30000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum time allowed for code execution
                </p>
              </div>

              <div>
                <Label htmlFor="errorHandling">Error Handling</Label>
                <Select value={data.errorHandling} onValueChange={(value) => updateData('errorHandling', value)}>
                  <SelectTrigger id="errorHandling">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="throw">Throw Error (Stop Workflow)</SelectItem>
                    <SelectItem value="returnError">Return Error Object</SelectItem>
                    <SelectItem value="returnNull">Return Null on Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Available Libraries</Label>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lodash"
                    checked={data.libraries?.lodash ?? false}
                    onCheckedChange={(checked) => updateLibraries('lodash', checked)}
                  />
                  <Label htmlFor="lodash">Lodash (_) - Utility functions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="moment"
                    checked={data.libraries?.moment ?? false}
                    onCheckedChange={(checked) => updateLibraries('moment', checked)}
                  />
                  <Label htmlFor="moment">Moment.js - Date manipulation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="crypto"
                    checked={data.libraries?.crypto ?? false}
                    onCheckedChange={(checked) => updateLibraries('crypto', checked)}
                  />
                  <Label htmlFor="crypto">Crypto - Hashing and encryption</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Execution Options</Label>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="asyncAllowed"
                    checked={data.options?.asyncAllowed ?? true}
                    onCheckedChange={(checked) => updateOptions('asyncAllowed', checked)}
                  />
                  <Label htmlFor="asyncAllowed">Allow async/await</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sandboxed"
                    checked={data.options?.sandboxed ?? true}
                    onCheckedChange={(checked) => updateOptions('sandboxed', checked)}
                  />
                  <Label htmlFor="sandboxed">Run in sandbox (recommended)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserveConsoleOutput"
                    checked={data.options?.preserveConsoleOutput ?? true}
                    onCheckedChange={(checked) => updateOptions('preserveConsoleOutput', checked)}
                  />
                  <Label htmlFor="preserveConsoleOutput">Capture console output</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div>
                <Label>Test Input (JSON)</Label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder='{"test": "data"}'
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={testCode} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>

              {testOutput && (
                <div>
                  <Label>Output</Label>
                  <Textarea
                    value={testOutput}
                    readOnly
                    rows={8}
                    className="font-mono text-sm bg-muted"
                  />
                </div>
              )}

              {testError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <strong>Error:</strong> {testError}
                  </div>
                </Alert>
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

export default CodeEditor;
