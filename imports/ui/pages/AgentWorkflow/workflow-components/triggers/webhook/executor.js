// Example: triggers/webhook/executor.js (Optional - for server-side execution)
export default async function executeWebhook(context) {
  const { node, payload, services } = context;

  // Register the webhook endpoint
  const webhookUrl = await services.webhook.register({
    path: node.data.path,
    method: node.data.method,
    authentication: node.data.authentication,
    workflowId: context.workflowId,
    nodeId: node.id
  });

  // Return the webhook URL for display
  return {
    webhookUrl,
    status: 'waiting',
    message: `Webhook registered at ${webhookUrl}`
  };
}
