// imports/ui/pages/AgentWorkflow/workflow-components/ai/ai-gateway/editor.jsx

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '/imports/ui/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/imports/ui/components/ui';
import { Switch } from '/imports/ui/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '/imports/ui/components/ui';
import { Alert } from '/imports/ui/components/ui';
import { Badge } from '/imports/ui/components/ui';
import { Brain, AlertCircle, Code, Settings, Zap } from 'lucide-react';

// Note: Slider component needs to be created or imported from another source
// For now, using a simple range input as fallback
const Slider = ({ value, onValueChange, min, max, step, className, id }) => {
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      className={`w-full ${className || ''}`}
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb 100%)`
      }}
    />
  );
};

const AIGatewayEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});
  const [errors, setErrors] = useState({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Get model info from node metadata (passed when creating the component)
  const modelInfo = node.modelInfo || {};

  useEffect(() => {
    // Initialize with model-specific defaults
    if (modelInfo.modelId && !data.modelId) {
      setData(prev => ({
        ...prev,
        modelId: modelInfo.modelId,
        modelName: modelInfo.name || modelInfo.modelId,
        provider: modelInfo.provider || 'unknown'
      }));
    }
  }, [modelInfo]);

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
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateData = (data) => {
    const errors = {};

    if (!data.prompt && !data.systemPrompt) {
      errors.prompt = 'Either a prompt or system prompt is required';
    }

    if (data.maxTokens < 1 || data.maxTokens > 32000) {
      errors.maxTokens = 'Max tokens must be between 1 and 32000';
    }

    if (data.temperature < 0 || data.temperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2';
    }

    return errors;
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const result = await Meteor.callAsync('aiGateway.testModelChat',
        data.modelId,
        "Hello! Please respond with a brief greeting to confirm you're working."
      );

      setTestResult({
        success: true,
        message: 'Connection successful!',
        response: result.choices?.[0]?.message?.content || 'Model responded successfully'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        error: error.message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleStopSequenceAdd = () => {
    const currentStops = data.stopSequences || [];
    updateData('stopSequences', [...currentStops, '']);
  };

  const handleStopSequenceChange = (index, value) => {
    const newStops = [...(data.stopSequences || [])];
    newStops[index] = value;
    updateData('stopSequences', newStops.filter(s => s.trim() !== ''));
  };

  const handleStopSequenceRemove = (index) => {
    const newStops = [...(data.stopSequences || [])];
    newStops.splice(index, 1);
    updateData('stopSequences', newStops);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain size={20} />
            Configure {modelInfo.name || 'AI Model'}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{modelInfo.provider || 'AI Gateway'}</Badge>
            <Badge variant="outline">{modelInfo.modelType || 'Chat Model'}</Badge>
            {modelInfo.capabilities?.map(cap => (
              <Badge key={cap} variant="secondary">{cap}</Badge>
            ))}
          </div>
        </DialogHeader>

        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="space-y-4">
            <div>
              <Label htmlFor="systemPrompt" className="flex items-center gap-2">
                <Settings size={16} />
                System Prompt
              </Label>
              <Textarea
                id="systemPrompt"
                value={data.systemPrompt || ''}
                onChange={(e) => updateData('systemPrompt', e.target.value)}
                placeholder="You are a helpful AI assistant..."
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Sets the behavior and context for the AI model
              </p>
            </div>

            <div>
              <Label htmlFor="prompt" className="flex items-center gap-2">
                <Code size={16} />
                User Prompt Template
              </Label>
              <Textarea
                id="prompt"
                value={data.prompt || ''}
                onChange={(e) => updateData('prompt', e.target.value)}
                placeholder="Use {{input}} to reference the input data. Example: Analyze this text: {{input}}"
                rows={6}
                className={`font-mono text-sm ${errors.prompt ? 'border-red-500' : ''}`}
                error={!!errors.prompt}
              />
              {errors.prompt && (
                <p className="text-sm text-red-500 mt-1">{errors.prompt}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use {'{{input}}'} to insert data from the previous component, {'{{field.name}}'} for specific fields
              </p>
            </div>

            <div>
              <Label htmlFor="responseFormat">Response Format</Label>
              <Select
                value={data.responseFormat || 'text'}
                onValueChange={(value) => updateData('responseFormat', value)}
              >
                <SelectTrigger id="responseFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                How the AI response should be formatted
              </p>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <div>
              <Label htmlFor="temperature" className="flex justify-between">
                <span>Temperature</span>
                <span className="text-sm font-normal">{data.temperature || 0.7}</span>
              </Label>
              <Slider
                id="temperature"
                value={[data.temperature || 0.7]}
                onValueChange={([value]) => updateData('temperature', value)}
                min={0}
                max={2}
                step={0.1}
                className={errors.temperature ? 'border-red-500' : ''}
              />
              {errors.temperature && (
                <p className="text-sm text-red-500 mt-1">{errors.temperature}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Controls randomness: 0 = deterministic, 2 = very creative
              </p>
            </div>

            <div>
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={data.maxTokens || 1000}
                onChange={(e) => updateData('maxTokens', parseInt(e.target.value) || 1000)}
                min="1"
                max="32000"
                className={errors.maxTokens ? 'border-red-500' : ''}
                error={!!errors.maxTokens}
              />
              {errors.maxTokens && (
                <p className="text-sm text-red-500 mt-1">{errors.maxTokens}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Maximum length of the response (1 token ≈ 4 characters)
              </p>
            </div>

            <div>
              <Label htmlFor="topP" className="flex justify-between">
                <span>Top P</span>
                <span className="text-sm font-normal">{data.topP || 1.0}</span>
              </Label>
              <Slider
                id="topP"
                value={[data.topP || 1.0]}
                onValueChange={([value]) => updateData('topP', value)}
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-sm text-gray-500 mt-1">
                Nucleus sampling: consider tokens with top cumulative probability
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequencyPenalty" className="flex justify-between">
                  <span>Frequency Penalty</span>
                  <span className="text-sm font-normal">{data.frequencyPenalty || 0}</span>
                </Label>
                <Slider
                  id="frequencyPenalty"
                  value={[data.frequencyPenalty || 0]}
                  onValueChange={([value]) => updateData('frequencyPenalty', value)}
                  min={-2}
                  max={2}
                  step={0.1}
                />
              </div>

              <div>
                <Label htmlFor="presencePenalty" className="flex justify-between">
                  <span>Presence Penalty</span>
                  <span className="text-sm font-normal">{data.presencePenalty || 0}</span>
                </Label>
                <Slider
                  id="presencePenalty"
                  value={[data.presencePenalty || 0]}
                  onValueChange={([value]) => updateData('presencePenalty', value)}
                  min={-2}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Penalties reduce repetition. Positive values discourage reuse.
            </p>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>Stop Sequences</Label>
              <div className="space-y-2">
                {(data.stopSequences || []).map((stop, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={stop}
                      onChange={(e) => handleStopSequenceChange(index, e.target.value)}
                      placeholder="Enter stop sequence"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopSequenceRemove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopSequenceAdd}
                >
                  Add Stop Sequence
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Sequences that will stop the generation when encountered
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stream"
                checked={data.stream || false}
                onCheckedChange={(checked) => updateData('stream', checked)}
              />
              <Label htmlFor="stream">Stream Response</Label>
            </div>
            <p className="text-sm text-gray-500">
              Stream the response token by token (useful for real-time applications)
            </p>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <div>
                <strong>Model Info:</strong><br />
                Model ID: {modelInfo.modelId || 'Not specified'}<br />
                Provider: {modelInfo.provider || 'Unknown'}<br />
                Type: {modelInfo.modelType || 'Chat'}<br />
                Status: {modelInfo.isActive ? 'Active' : 'Inactive'}
              </div>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <strong>{testResult.message}</strong>
                  {testResult.response && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                      {testResult.response}
                    </div>
                  )}
                  {testResult.error && (
                    <div className="mt-2 text-sm">{testResult.error}</div>
                  )}
                </div>
              </Alert>
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

export default AIGatewayEditor;
