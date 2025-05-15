// /imports/startup/server/faq-fixtures.js
import { Meteor } from 'meteor/meteor';
import { FaqCollection } from '/imports/api/faq/collection';

/**
 * Loads initial FAQ data into the new FaqCollection
 * This contains the StronglyGPT FAQ content formatted for the new schema
 */
Meteor.startup(async () => {
  try {
    console.log('Checking for FAQ data...');

    // Check if collection has data
    const faqCount = await FaqCollection.countDocuments();

    // Only load initial data if collection is empty
    if (faqCount === 0) {
      console.log('No FAQ data found. Loading initial data...');

      // Get admin user to set as creator
      const adminUser = await Meteor.users.findOneAsync({ 'emails.address': 'admin@strongly.ai' });
      const userId = adminUser ? adminUser._id : 'system';

      // Initial FAQ items with the latest content
      const faqItems = [
        {
          question: "What is StronglyGPT and how does it work?",
          answer: `
            <p>StronglyGPT is a versatile platform that allows users to interact with their preferred third-party large language models (LLMs) through Strongly's secure interface. It offers multiple access points including:</p>
            <ul>
              <li>Our main platform</li>
              <li>Browser plugin</li>
              <li>REST API</li>
            </ul>
            <p>This flexibility ensures that you can integrate StronglyGPT into your workflow seamlessly, whether you're using it for content creation, data analysis, or any other AI-assisted task.</p>
          `,
          category: "general",
          order: 1,
          isPublished: true
        },
        {
          question: "How does Strongly.AI ensure data safety and security?",
          answer: `
            <p>Strongly.AI prioritizes data security through a multi-layered approach:</p>
            <ol>
              <li>We employ advanced filtering techniques using regular expressions (Regex).</li>
              <li>Our internal LLM model provides an additional layer of content analysis.</li>
              <li>We leverage third-party tools via our AI Hub for comprehensive security checks.</li>
            </ol>
            <p>While no system is 100% foolproof, this combination offers significantly enhanced security compared to unfiltered LLM interactions. Additionally, we adhere to strict data protection policies and encrypt all data in transit and at rest.</p>
          `,
          category: "security",
          order: 2,
          isPublished: true
        },
        {
          question: "What customization options does Strongly.AI offer?",
          answer: `
            <p>Strongly.AI provides extensive customization capabilities:</p>
            <ol>
              <li><strong>Custom Filter Rules:</strong> Users can create tailored filter rules using Regex patterns, word and phrase lookups, and topic assessments.</li>
              <li><strong>LLM Integration:</strong> You can integrate your preferred LLM, ensuring compatibility with your existing AI infrastructure.</li>
              <li><strong>Workflow Customization:</strong> We offer options to adapt Strongly.AI to your specific business processes and needs.</li>
            </ol>
            <p>For more advanced customization requirements, our team is always ready to discuss bespoke solutions.</p>
          `,
          category: "features",
          order: 3,
          isPublished: true
        },
        {
          question: "How frequently is Strongly.AI updated, and how does this affect different deployment options?",
          answer: `
            <p>We maintain a regular update schedule to ensure Strongly.AI remains cutting-edge:</p>
            <ol>
              <li><strong>Cloud Version:</strong> Updates are deployed every two weeks, providing you with the latest features and security enhancements automatically.</li>
              <li><strong>Private Cloud and On-Premise Installations:</strong> These can be updated manually at your convenience, allowing you to control the timing of updates to suit your operational needs.</li>
            </ol>
            <p>We always provide detailed release notes and, if necessary, migration guides for each update.</p>
          `,
          category: "technical",
          order: 4,
          isPublished: true
        },
        {
          question: "What options are available for trying out Strongly.AI?",
          answer: `
            <p>We offer flexible options to get started with Strongly.AI:</p>
            <ol>
              <li><strong>Free 30-day Trial:</strong> This full-featured trial allows you to explore all capabilities of Strongly.AI.</li>
              <li><strong>Free Basic Plan:</strong> For those looking to use Strongly.AI long-term but with limited needs.</li>
              <li><strong>Custom Plans:</strong> We can tailor a plan to your specific requirements.</li>
            </ol>
            <p>To discuss these options or set up a trial, please contact us at <a href="mailto:info@strongly.ai">info@strongly.ai</a>.</p>
          `,
          category: "general",
          order: 5,
          isPublished: true
        },
        {
          question: "How can I request new features or provide feedback?",
          answer: `
            <p>We highly value user feedback and feature requests. You can:</p>
            <ol>
              <li>Email us directly at <a href="mailto:info@strongly.ai">info@strongly.ai</a> with your ideas or feedback.</li>
              <li>Use the feedback option within the Strongly.AI platform.</li>
              <li>Participate in our regular user surveys and feedback sessions.</li>
            </ol>
            <p>Our product team reviews all requests and incorporates them into our development roadmap where possible.</p>
          `,
          category: "support",
          order: 6,
          isPublished: true
        },
        {
          question: "Does Strongly.AI offer training or educational resources?",
          answer: `
            <p>Yes, we provide comprehensive educational support:</p>
            <ol>
              <li><strong>Workshops:</strong> Regular online and in-person workshops on Strongly.AI and LLM usage.</li>
              <li><strong>Training Sessions:</strong> Customized training for your team on effectively using Strongly.AI.</li>
              <li><strong>Documentation:</strong> Extensive online resources, including user guides and best practices.</li>
              <li><strong>Webinars:</strong> Monthly webinars covering new features and advanced usage scenarios.</li>
            </ol>
            <p>Contact <a href="mailto:info@strongly.ai">info@strongly.ai</a> to discuss your specific training needs or to access our educational resources.</p>
          `,
          category: "support",
          order: 7,
          isPublished: true
        },
        {
          question: "Can I use Strongly.AI with any LLM, including ones not currently listed?",
          answer: `
            <p>Absolutely! Strongly.AI is designed to be LLM-agnostic:</p>
            <ol>
              <li><strong>Wide Compatibility:</strong> We work with all major LLMs and are constantly expanding our direct integrations.</li>
              <li><strong>Custom Integrations:</strong> If your preferred LLM isn't listed, we can quickly add support for it.</li>
              <li><strong>API Flexibility:</strong> Our API allows for easy integration with any LLM of your choice.</li>
            </ol>
            <p>Please reach out to <a href="mailto:info@strongly.ai">info@strongly.ai</a> with details of the LLM you'd like to use, and we'll ensure seamless integration.</p>
          `,
          category: "technical",
          order: 8,
          isPublished: true
        },
        {
          question: "What is AI alignment, and why is it important in the context of Strongly.AI?",
          answer: `
            <p>AI alignment is a critical concept in AI development and deployment:</p>
            <ol>
              <li><strong>Definition:</strong> It refers to the practice of ensuring AI systems behave in ways that are consistent with human values, intentions, and ethical principles.</li>
              <li><strong>Importance:</strong> As AI systems become more advanced and are deployed in sensitive domains, alignment ensures they remain beneficial and do not cause unintended harm.</li>
              <li><strong>Strongly.AI's Approach:</strong> We incorporate AI alignment principles in our platform through ethical filters, customizable rules, and transparent AI decision-making processes.</li>
              <li><strong>User Control:</strong> Our platform allows you to align AI outputs with your organization's specific values and guidelines.</li>
            </ol>
          `,
          category: "technical",
          order: 9,
          isPublished: true
        },
        {
          question: "How do I manage token credits, and what options are available for adding more?",
          answer: `
            <p>Token credit management in Strongly.AI is straightforward:</p>
            <ol>
              <li><strong>Admin Controls:</strong> Administrators can add company-wide token credits via the billing page.</li>
              <li><strong>Credit Usage:</strong> Company-wide credits can be used by any user within your organization.</li>
              <li><strong>Expiration:</strong> Credits expire monthly to ensure fair usage and accurate billing.</li>
              <li><strong>Adding Credits:</strong> Click 'Add token credits' on the billing page to purchase more.</li>
              <li><strong>Custom Plans:</strong> For high-volume users, we offer custom credit plans. Contact <a href="mailto:info@strongly.ai">info@strongly.ai</a> for details.</li>
              <li><strong>Monitoring:</strong> Use our dashboard to track credit usage and set up alerts for low credit notifications.</li>
            </ol>
          `,
          category: "account",
          order: 10,
          isPublished: true
        }
      ];

      // Insert FAQ items
      let insertedCount = 0;
      for (const faq of faqItems) {
        try {
          await FaqCollection.insertAsync({
            ...faq,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          insertedCount++;
        } catch (error) {
          console.error(`Error creating FAQ item "${faq.question}":`, error);
        }
      }

      console.log(`Created ${insertedCount} FAQ items`);

      // Create text search index
      try {
        await FaqCollection.createIndexAsync({ question: 'text', answer: 'text', category: 'text' });
        console.log('Created text search index on FaqCollection');
      } catch (indexError) {
        console.warn('Note: Could not create text search index:', indexError.message);
      }
    } else {
      console.log(`FAQ data already exists (${faqCount} items). Skipping initial data load.`);
    }
  } catch (error) {
    console.error('Error loading FAQ fixtures:', error);
  }
});
