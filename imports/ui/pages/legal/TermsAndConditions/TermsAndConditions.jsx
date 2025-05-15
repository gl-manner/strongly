// /imports/ui/pages/legal/TermsAndConditions/TermsAndConditions.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './TermsAndConditions.scss';

export const TermsAndConditions = () => {
  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Get current date for the last updated field
  const lastUpdated = 'May 11, 2025';

  return (
    <div className="terms-wrapper">
      <div className="terms-header">
        <h1 className="page-title">Terms and Conditions</h1>
        <p className="last-updated">Last Updated: {lastUpdated}</p>
      </div>

      <div className="terms-container">
        <div className="terms-nav">
          <ul>
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#definitions">Definitions</a></li>
            <li><a href="#account">Account Terms</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#payment">Payment Terms</a></li>
            <li><a href="#data">Data & Privacy</a></li>
            <li><a href="#ip">Intellectual Property</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#termination">Termination</a></li>
            <li><a href="#changes">Changes to Terms</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="terms-content">
          <section id="introduction">
            <h2>1. Introduction</h2>
            <p>
              Welcome to StronglyAI, Inc. ("StronglyAI," "we," "us," or "our"). These Terms and Conditions
              ("Terms") govern your access to and use of StronglyAI's website, services, applications,
              products, and platform (collectively, the "Services").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms and our Privacy
              Policy. If you do not agree to these Terms, you must not access or use the Services.
            </p>
            <p>
              StronglyAI provides artificial intelligence solutions and tools to help businesses and
              individuals optimize their operations, automate workflows, and gain insights from data.
              Our platform includes machine learning models, APIs, and related technologies.
            </p>
          </section>

          <section id="definitions">
            <h2>2. Definitions</h2>
            <div className="definition-list">
              <div className="definition-item">
                <h3>"User"</h3>
                <p>Refers to any individual or entity that accesses or uses our Services.</p>
              </div>
              <div className="definition-item">
                <h3>"Account"</h3>
                <p>Refers to a registered user profile on our platform that allows access to our Services.</p>
              </div>
              <div className="definition-item">
                <h3>"Content"</h3>
                <p>Refers to data, text, images, videos, audio files, outputs, or other materials that users provide to or receive from our Services.</p>
              </div>
              <div className="definition-item">
                <h3>"Subscription"</h3>
                <p>Refers to the paid access to our Services on a recurring basis according to the plan selected by the User.</p>
              </div>
            </div>
          </section>

          <section id="account">
            <h2>3. Account Terms</h2>
            <h3>3.1. Account Registration</h3>
            <p>
              To access certain features of our Services, you must register for an account. When you register, you must provide accurate and complete information and keep this information updated. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.
            </p>

            <h3>3.2. Account Requirements</h3>
            <p>
              To create an account, you must be at least 18 years old and capable of forming a binding contract with StronglyAI. By creating an account, you represent and warrant that you meet these requirements.
            </p>

            <h3>3.3. Administrator Approval</h3>
            <p>
              Some account registrations may require administrator approval before gaining full access to our Services. During this approval process, your account may have limited functionality. We reserve the right to approve or reject any account registration at our sole discretion.
            </p>
          </section>

          <section id="services">
            <h2>4. Services</h2>
            <h3>4.1. Service Description</h3>
            <p>
              StronglyAI provides a range of artificial intelligence services, including but not limited to: machine learning models, AI-powered analytics, automated decision-making tools, workflow automation, and API access to our technology.
            </p>

            <h3>4.2. Service Modifications</h3>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our Services at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of our Services.
            </p>

            <h3>4.3. Service Limitations</h3>
            <p>
              Our Services are subject to limitations, including but not limited to: API rate limits, computational resource constraints, and data processing capacities as specified in your subscription plan. We reserve the right to enforce these limitations to ensure the stability and availability of our Services for all users.
            </p>
          </section>

          <section id="payment">
            <h2>5. Payment Terms</h2>
            <h3>5.1. Subscription Fees</h3>
            <p>
              Access to certain features of our Services requires a paid subscription. Subscription fees are based on the plan you select and are billed in advance on a recurring basis. All fees are non-refundable unless expressly stated otherwise or required by applicable law.
            </p>

            <h3>5.2. Payment Methods</h3>
            <p>
              We accept payment through credit cards, bank transfers, and other payment methods as specified on our website. By providing a payment method, you authorize us to charge the applicable fees to that payment method.
            </p>

            <h3>5.3. Taxes</h3>
            <p>
              All fees are exclusive of taxes, which we will charge as applicable. You are responsible for paying all taxes associated with your use of our Services unless we expressly state that taxes are included.
            </p>
          </section>

          <section id="data">
            <h2>6. Data & Privacy</h2>
            <h3>6.1. Data Processing</h3>
            <p>
              We process your data in accordance with our Privacy Policy, which is incorporated into these Terms by reference. By using our Services, you consent to the collection, use, and sharing of your information as described in our Privacy Policy.
            </p>

            <h3>6.2. User Content</h3>
            <p>
              You retain ownership of any content that you submit, upload, or otherwise provide to our Services. By providing content to our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, create derivative works from, distribute, publicly display, and publicly perform your content to provide and improve our Services.
            </p>

            <h3>6.3. Data Security</h3>
            <p>
              We implement reasonable security measures to protect your data, but we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account.
            </p>
          </section>

          <section id="ip">
            <h2>7. Intellectual Property</h2>
            <h3>7.1. StronglyAI's Intellectual Property</h3>
            <p>
              All intellectual property rights in and to our Services, including but not limited to software, models, algorithms, designs, and content created by us, are owned by StronglyAI or its licensors. Nothing in these Terms grants you any right, title, or interest in our intellectual property.
            </p>

            <h3>7.2. AI-Generated Content</h3>
            <p>
              For content generated by our AI models based on your inputs, we grant you a non-exclusive license to use such content for your internal business purposes, subject to compliance with these Terms. However, we retain the right to use anonymized data and patterns from interactions with our Services to improve our models and services.
            </p>

            <h3>7.3. Feedback</h3>
            <p>
              If you provide feedback, suggestions, or ideas about our Services, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, modify, create derivative works from, distribute, publicly display, and publicly perform your feedback for any purpose without compensation to you.
            </p>
          </section>

          <section id="liability">
            <h2>8. Limitation of Liability</h2>
            <h3>8.1. Disclaimer of Warranties</h3>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3>8.2. Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL STRONGLYAI, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE OUR SERVICES.
            </p>

            <h3>8.3. Cap on Liability</h3>
            <p>
              OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE GREATER OF (A) THE AMOUNT PAID, IF ANY, BY YOU TO STRONGLYAI FOR THE SERVICES DURING THE 12 MONTHS PRIOR TO THE EVENT GIVING RISE TO LIABILITY OR (B) $100.
            </p>
          </section>

          <section id="termination">
            <h2>9. Termination</h2>
            <h3>9.1. Termination by You</h3>
            <p>
              You may terminate your account at any time by following the instructions on our website or by contacting our support team. Upon termination, you will continue to have access to our Services until the end of your current billing period.
            </p>

            <h3>9.2. Termination by StronglyAI</h3>
            <p>
              We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use our Services will immediately cease.
            </p>

            <h3>9.3. Effects of Termination</h3>
            <p>
              Upon termination, your account will be deactivated and you may lose access to content, data, or other information associated with your account. We may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          <section id="changes">
            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time by posting the revised version on our website. The revised version will be effective at the time we post it. Your continued use of our Services after the effective date of the revised Terms constitutes your acceptance of the changes.
            </p>
            <p>
              For material changes to these Terms, we will make reasonable efforts to notify you through our website, email, or other communication methods. If you do not agree to the revised Terms, you must stop using our Services.
            </p>
          </section>

          <section id="contact">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions or concerns about these Terms or our Services, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>StronglyAI, Inc.</strong></p>
              <p>1347 Chalmette Drive NE</p>
              <p>Atlanta, GA, 30306</p>
              <p>United States</p>
              <p>Email: <a href="mailto:legal@stronglyai.com">info@strongly.ai</a></p>
              <p>Phone: +1 (678) 651-0795</p>
            </div>
          </section>

          <div className="terms-footer">
            <p>© {new Date().getFullYear()} StronglyAI, Inc. All rights reserved.</p>
            <div className="terms-actions">
              <Link to="/login" className="btn-outline">
                <i data-feather="arrow-left"></i> Back to Login
              </Link>
              <Link to="/register" className="btn-primary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
