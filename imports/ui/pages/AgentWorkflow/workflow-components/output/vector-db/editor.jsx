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
import { Alert } from 'ui/components/ui';
import { Info } from 'lucide-react';

const VectorDBEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {
    provider: 'pinecone',
    apiKey: '',
    indexName: '',
    namespace: '',
    textField: 'text',
    metadataFields: [],
    embeddingModel: 'text-embedding-ada-002',
    upsertMode: 'create',
    batchSize: 100,
    includeTimestamp: true
  });

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleMetadataFieldsChange = (value) => {
    const fields = value.split(',').map(f => f.trim()).filter(f => f);
    updateData('metadataFields', fields);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Vector Database Output</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <Label htmlFor="provider">Vector DB Provider</Label>
            <Select value={data.provider} onValueChange={(value) => updateData('provider', value)}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pinecone">Pinecone</SelectItem>
                <SelectItem value="weaviate">Weaviate</SelectItem>
                <SelectItem value="qdrant">Qdrant</SelectItem>
                <SelectItem value="chroma">Chroma</SelectItem>
                <SelectItem value="milvus">Milvus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={data.apiKey || ''}
              onChange={(e) => updateData('apiKey', e.target.value)}
              placeholder={`Enter ${data.provider} API key`}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your API key will be encrypted and stored securely
            </p>
          </div>

          {/* Index/Collection Name */}
          <div>
            <Label htmlFor="indexName">
              {data.provider === 'weaviate' ? 'Collection Name' : 'Index Name'}
            </Label>
            <Input
              id="indexName"
              value={data.indexName || ''}
              onChange={(e) => updateData('indexName', e.target.value)}
              placeholder={`Enter ${data.provider === 'weaviate' ? 'collection' : 'index'} name`}
            />
          </div>

          {/* Namespace (for providers that support it) */}
          {['pinecone', 'milvus'].includes(data.provider) && (
            <div>
              <Label htmlFor="namespace">Namespace (Optional)</Label>
              <Input
                id="namespace"
                value={data.namespace || ''}
                onChange={(e) => updateData('namespace', e.target.value)}
                placeholder="Enter namespace for data partitioning"
              />
            </div>
          )}

          {/* Embedding Model */}
          <div>
            <Label htmlFor="embeddingModel">Embedding Model</Label>
            <Select value={data.embeddingModel} onValueChange={(value) => updateData('embeddingModel', value)}>
              <SelectTrigger id="embeddingModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-embedding-ada-002">OpenAI Ada 002</SelectItem>
                <SelectItem value="text-embedding-3-small">OpenAI v3 Small</SelectItem>
                <SelectItem value="text-embedding-3-large">OpenAI v3 Large</SelectItem>
                <SelectItem value="voyage-2">Voyage AI 2</SelectItem>
                <SelectItem value="voyage-large-2">Voyage AI Large 2</SelectItem>
                <SelectItem value="embed-english-v3.0">Cohere English v3</SelectItem>
                <SelectItem value="embed-multilingual-v3.0">Cohere Multilingual v3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Field */}
          <div>
            <Label htmlFor="textField">Text Field Name</Label>
            <Input
              id="textField"
              value={data.textField || ''}
              onChange={(e) => updateData('textField', e.target.value)}
              placeholder="Field name containing text to embed (e.g., 'content', 'description')"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The field in your data that contains the text to be embedded
            </p>
          </div>

          {/* Metadata Fields */}
          <div>
            <Label htmlFor="metadataFields">Metadata Fields</Label>
            <Textarea
              id="metadataFields"
              value={data.metadataFields?.join(', ') || ''}
              onChange={(e) => handleMetadataFieldsChange(e.target.value)}
              placeholder="Comma-separated field names (e.g., title, author, category)"
              rows={2}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Additional fields to store as metadata for filtering and retrieval
            </p>
          </div>

          {/* Upsert Mode */}
          <div>
            <Label htmlFor="upsertMode">Upsert Mode</Label>
            <Select value={data.upsertMode} onValueChange={(value) => updateData('upsertMode', value)}>
              <SelectTrigger id="upsertMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create New (Skip Existing)</SelectItem>
                <SelectItem value="update">Update Existing</SelectItem>
                <SelectItem value="replace">Replace All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batch Size */}
          <div>
            <Label htmlFor="batchSize">Batch Size</Label>
            <Input
              id="batchSize"
              type="number"
              value={data.batchSize || 100}
              onChange={(e) => updateData('batchSize', parseInt(e.target.value) || 100)}
              min="1"
              max="1000"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Number of vectors to process in each batch (1-1000)
            </p>
          </div>

          {/* Include Timestamp */}
          <div className="flex items-center space-x-2">
            <Switch
              id="includeTimestamp"
              checked={data.includeTimestamp}
              onCheckedChange={(checked) => updateData('includeTimestamp', checked)}
            />
            <Label htmlFor="includeTimestamp" className="cursor-pointer">
              Include timestamp in metadata
            </Label>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <div>
              This component will embed text data and store it in your vector database for semantic search.
              Make sure your input data contains the specified text field and any metadata fields you want to store.
            </div>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VectorDBEditor;
