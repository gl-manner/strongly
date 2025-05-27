// imports/ui/pages/AgentWorkflow/workflow-components/output/email/executor.js

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import AWS from 'aws-sdk';
import mailgun from 'mailgun-js';

export default async function executeEmail(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Process template variables in email fields
    const processedData = processEmailTemplates(data, input);

    // Send email based on provider
    let result;
    switch (data.provider) {
      case 'smtp':
        result = await sendSmtpEmail(processedData, env);
        break;
      case 'sendgrid':
        result = await sendSendgridEmail(processedData, env);
        break;
      case 'aws-ses':
        result = await sendSesEmail(processedData, env);
        break;
      case 'mailgun':
        result = await sendMailgunEmail(processedData, env);
        break;
      default:
        throw new Error(`Unsupported email provider: ${data.provider}`);
    }

    return {
      success: true,
      data: {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        response: result.response
      },
      metadata: {
        provider: data.provider,
        to: processedData.to,
        subject: processedData.subject,
        sentAt: new Date()
      }
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        provider: data.provider,
        to: data.to
      }
    };
  }
}

function processEmailTemplates(data, input) {
  const processed = { ...data };

  // Process template variables in string fields
  const templateFields = ['to', 'cc', 'bcc', 'from', 'fromName', 'replyTo', 'subject', 'body'];

  templateFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = replaceTemplateVariables(processed[field], input);
    }
  });

  // Process headers
  if (processed.headers) {
    const processedHeaders = {};
    Object.entries(processed.headers).forEach(([key, value]) => {
      processedHeaders[key] = replaceTemplateVariables(value, input);
    });
    processed.headers = processedHeaders;
  }

  return processed;
}

function replaceTemplateVariables(template, data) {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    return value !== undefined ? String(value) : match;
  });
}

async function sendSmtpEmail(data, env) {
  // Get SMTP configuration
  let smtpConfig;

  if (data.useEnvCredentials) {
    const prefix = data.envPrefix || 'EMAIL_';
    smtpConfig = {
      host: env[`${prefix}HOST`],
      port: parseInt(env[`${prefix}PORT`]) || 587,
      secure: env[`${prefix}SECURE`] === 'true',
      auth: {
        user: env[`${prefix}USER`],
        pass: env[`${prefix}PASSWORD`]
      }
    };
  } else {
    smtpConfig = {
      host: data.smtpHost,
      port: data.smtpPort,
      secure: data.smtpSecure,
      auth: {
        user: data.smtpUser,
        pass: data.smtpPassword
      }
    };
  }

  // Create transporter
  const transporter = nodemailer.createTransporter(smtpConfig);

  // Prepare email options
  const mailOptions = {
    from: data.fromName ? `${data.fromName} <${data.from}>` : data.from,
    to: data.to,
    subject: data.subject,
    headers: data.headers
  };

  if (data.cc) mailOptions.cc = data.cc;
  if (data.bcc) mailOptions.bcc = data.bcc;
  if (data.replyTo) mailOptions.replyTo = data.replyTo;

  // Set body based on type
  if (data.bodyType === 'html') {
    mailOptions.html = data.body;
  } else if (data.bodyType === 'text') {
    mailOptions.text = data.body;
  } else if (data.bodyType === 'both') {
    // For both, assume body is HTML and generate text version
    mailOptions.html = data.body;
    mailOptions.text = data.body.replace(/<[^>]*>/g, ''); // Simple HTML stripping
  }

  // Add attachments if any
  if (data.attachments && data.attachments.length > 0) {
    mailOptions.attachments = data.attachments;
  }

  // Send email
  const result = await transporter.sendMail(mailOptions);
  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
    response: result.response
  };
}

async function sendSendgridEmail(data, env) {
  const apiKey = data.useEnvCredentials ?
    env[data.apiKeyEnvVar || 'EMAIL_API_KEY'] :
    data.apiKey;

  sgMail.setApiKey(apiKey);

  const msg = {
    from: data.fromName ? { email: data.from, name: data.fromName } : data.from,
    to: data.to.split(',').map(email => email.trim()),
    subject: data.subject
  };

  if (data.cc) msg.cc = data.cc.split(',').map(email => email.trim());
  if (data.bcc) msg.bcc = data.bcc.split(',').map(email => email.trim());
  if (data.replyTo) msg.replyTo = data.replyTo;

  // Set content
  if (data.bodyType === 'html') {
    msg.html = data.body;
  } else if (data.bodyType === 'text') {
    msg.text = data.body;
  } else if (data.bodyType === 'both') {
    msg.html = data.body;
    msg.text = data.body.replace(/<[^>]*>/g, '');
  }

  // Add tracking settings
  if (data.trackOpens !== undefined || data.trackClicks !== undefined) {
    msg.trackingSettings = {
      clickTracking: { enable: data.trackClicks || false },
      openTracking: { enable: data.trackOpens || false }
    };
  }

  // Add custom headers
  if (data.headers && Object.keys(data.headers).length > 0) {
    msg.headers = data.headers;
  }

  // Add tags/categories
  if (data.tags && data.tags.length > 0) {
    msg.categories = data.tags;
  }

  const response = await sgMail.send(msg);
  return {
    messageId: response[0].headers['x-message-id'],
    accepted: [data.to],
    rejected: [],
    response: 'Email sent via SendGrid'
  };
}

async function sendSesEmail(data, env) {
  const sesConfig = data.useEnvCredentials ? {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION || 'us-east-1'
  } : {
    accessKeyId: data.awsAccessKey,
    secretAccessKey: data.awsSecretKey,
    region: data.awsRegion || 'us-east-1'
  };

  const ses = new AWS.SES(sesConfig);

  const params = {
    Source: data.fromName ? `${data.fromName} <${data.from}>` : data.from,
    Destination: {
      ToAddresses: data.to.split(',').map(email => email.trim())
    },
    Message: {
      Subject: { Data: data.subject },
      Body: {}
    }
  };

  if (data.cc) {
    params.Destination.CcAddresses = data.cc.split(',').map(email => email.trim());
  }
  if (data.bcc) {
    params.Destination.BccAddresses = data.bcc.split(',').map(email => email.trim());
  }
  if (data.replyTo) {
    params.ReplyToAddresses = [data.replyTo];
  }

  // Set body
  if (data.bodyType === 'html' || data.bodyType === 'both') {
    params.Message.Body.Html = { Data: data.body };
  }
  if (data.bodyType === 'text' || data.bodyType === 'both') {
    params.Message.Body.Text = {
      Data: data.bodyType === 'both' ? data.body.replace(/<[^>]*>/g, '') : data.body
    };
  }

  const result = await ses.sendEmail(params).promise();
  return {
    messageId: result.MessageId,
    accepted: data.to.split(',').map(email => email.trim()),
    rejected: [],
    response: 'Email sent via AWS SES'
  };
}

async function sendMailgunEmail(data, env) {
  const apiKey = data.useEnvCredentials ?
    env[data.apiKeyEnvVar || 'EMAIL_API_KEY'] :
    data.apiKey;

  const domain = data.useEnvCredentials ?
    env.MAILGUN_DOMAIN :
    data.mailgunDomain;

  const mg = mailgun({ apiKey, domain });

  const mailData = {
    from: data.fromName ? `${data.fromName} <${data.from}>` : data.from,
    to: data.to,
    subject: data.subject
  };

  if (data.cc) mailData.cc = data.cc;
  if (data.bcc) mailData.bcc = data.bcc;
  if (data['h:Reply-To']) mailData['h:Reply-To'] = data.replyTo;

  // Set body
  if (data.bodyType === 'html') {
    mailData.html = data.body;
  } else if (data.bodyType === 'text') {
    mailData.text = data.body;
  } else if (data.bodyType === 'both') {
    mailData.html = data.body;
    mailData.text = data.body.replace(/<[^>]*>/g, '');
  }

  // Add tracking
  if (data.trackOpens !== undefined) {
    mailData['o:tracking-opens'] = data.trackOpens ? 'yes' : 'no';
  }
  if (data.trackClicks !== undefined) {
    mailData['o:tracking-clicks'] = data.trackClicks ? 'yes' : 'no';
  }

  // Add tags
  if (data.tags && data.tags.length > 0) {
    mailData['o:tag'] = data.tags;
  }

  // Add custom headers
  Object.entries(data.headers || {}).forEach(([key, value]) => {
    mailData[`h:${key}`] = value;
  });

  const result = await mg.messages().send(mailData);
  return {
    messageId: result.id,
    accepted: [data.to],
    rejected: [],
    response: result.message
  };
}
