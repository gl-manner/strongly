// /imports/api/contact/contactMethods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Email } from 'meteor/email';

Meteor.methods({
  /**
   * Send contact form message via email
   * @param {Object} formData - Contact form data
   */
  'contact.sendMessage': async function(formData) {
    check(formData, {
      name: String,
      email: String,
      phone: Match.Optional(String),
      subject: Match.Optional(String),
      category: String,
      message: String
    });

    // Server-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      throw new Meteor.Error('validation-error', 'Name, email, and message are required.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Meteor.Error('validation-error', 'Please provide a valid email address.');
    }

    // Sanitize inputs
    const sanitizedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone ? formData.phone.trim() : '',
      subject: formData.subject ? formData.subject.trim() : '',
      category: formData.category,
      message: formData.message.trim()
    };

    // Generate email subject
    const emailSubject = sanitizedData.subject
      ? `Contact Form: ${sanitizedData.subject}`
      : `Contact Form Submission - ${sanitizedData.category.charAt(0).toUpperCase() + sanitizedData.category.slice(1)}`;

    // Generate email content
    const emailContent = generateEmailContent(sanitizedData);

    try {
      // Send email to support team
      await Email.sendAsync({
        to: 'support@strongly.ai',
        from: 'support@strongly.ai',
        replyTo: sanitizedData.email,
        subject: emailSubject,
        html: emailContent.html,
        text: emailContent.text
      });

      // Send confirmation email to user
      const confirmationContent = generateConfirmationEmail(sanitizedData);

      await Email.sendAsync({
        to: sanitizedData.email,
        from: 'support@strongly.ai',
        subject: 'Thank you for contacting StronglyAI',
        html: confirmationContent.html,
        text: confirmationContent.text
      });

      return { success: true };

    } catch (error) {
      console.error('Error sending contact email:', error);
      throw new Meteor.Error('email-send-failed', 'Failed to send email. Please try again later.');
    }
  }
});

/**
 * Generate HTML and text content for the contact email
 */
function generateEmailContent(data) {
  const categoryLabels = {
    general: 'General Inquiry',
    support: 'Technical Support',
    billing: 'Billing Question',
    partnership: 'Partnership',
    feedback: 'Feedback',
    other: 'Other'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #2c3e50; display: block; margin-bottom: 5px; }
        .value { background: white; padding: 10px; border-radius: 5px; border: 1px solid #dee2e6; }
        .message-content { min-height: 100px; white-space: pre-wrap; }
        .footer { background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <div class="value">${data.name}</div>
          </div>

          <div class="field">
            <span class="label">Email:</span>
            <div class="value">${data.email}</div>
          </div>

          ${data.phone ? `
          <div class="field">
            <span class="label">Phone:</span>
            <div class="value">${data.phone}</div>
          </div>
          ` : ''}

          <div class="field">
            <span class="label">Category:</span>
            <div class="value">${categoryLabels[data.category] || data.category}</div>
          </div>

          ${data.subject ? `
          <div class="field">
            <span class="label">Subject:</span>
            <div class="value">${data.subject}</div>
          </div>
          ` : ''}

          <div class="field">
            <span class="label">Message:</span>
            <div class="value message-content">${data.message}</div>
          </div>

          <div class="field">
            <span class="label">Submitted:</span>
            <div class="value">${new Date().toLocaleString()}</div>
          </div>
        </div>
        <div class="footer">
          This message was sent via the StronglyAI contact form.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Category: ${categoryLabels[data.category] || data.category}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message}

Submitted: ${new Date().toLocaleString()}

---
This message was sent via the StronglyAI contact form.
  `;

  return { html, text };
}

/**
 * Generate confirmation email content for the user
 */
function generateConfirmationEmail(data) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for contacting us</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; }
        .highlight { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Thank You for Contacting Us!</h2>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>

          <p>Thank you for reaching out to StronglyAI. We have received your message and our team will review it shortly.</p>

          <div class="highlight">
            <strong>What happens next?</strong><br>
            • Our support team will review your message within 24 hours<br>
            • You'll receive a detailed response via email<br>
            • For urgent matters, please call us at +1 (555) 123-4567
          </div>

          <p><strong>Your message details:</strong></p>
          <p><strong>Category:</strong> ${data.category}<br>
          ${data.subject ? `<strong>Subject:</strong> ${data.subject}<br>` : ''}
          <strong>Submitted:</strong> ${new Date().toLocaleString()}</p>

          <p>In the meantime, you might find answers to common questions in our FAQ section:</p>

          <p style="text-align: center;">
            <a href="${Meteor.absoluteUrl('faq')}" class="button">View FAQ</a>
          </p>

          <p>Best regards,<br>
          The StronglyAI Support Team</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} StronglyAI. All rights reserved.<br>
          If you didn't send this message, please ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank You for Contacting StronglyAI!

Hi ${data.name},

Thank you for reaching out to us. We have received your message and our team will review it shortly.

What happens next?
• Our support team will review your message within 24 hours
• You'll receive a detailed response via email
• For urgent matters, please call us at +1 (555) 123-4567

Your message details:
Category: ${data.category}
${data.subject ? `Subject: ${data.subject}` : ''}
Submitted: ${new Date().toLocaleString()}

You can also check our FAQ section for answers to common questions: ${Meteor.absoluteUrl('faq')}

Best regards,
The StronglyAI Support Team

---
© ${new Date().getFullYear()} StronglyAI. All rights reserved.
If you didn't send this message, please ignore this email.
  `;

  return { html, text };
}
