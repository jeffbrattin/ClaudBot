require('dotenv').config();
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Load credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN; // You'll need to save this from your OAuth flow

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Clawdbot skill definition
module.exports = {
  name: 'gmail',
  description: 'Read and send Gmail emails',
  version: '1.0.0',
  
  tools: [
    {
      name: 'list_emails',
      description: 'List recent emails from Gmail inbox',
      parameters: {
        type: 'object',
        properties: {
          maxResults: {
            type: 'number',
            description: 'Maximum number of emails to return (default 10)',
            default: 10
          },
          query: {
            type: 'string',
            description: 'Gmail search query (e.g., "is:unread", "from:someone@example.com")',
            default: ''
          }
        }
      },
      async execute({ maxResults = 10, query = '' }) {
        try {
          const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
            q: query
          });

          const messages = response.data.messages || [];
          const emailDetails = [];

          // Fetch details for each message
          for (const message of messages.slice(0, maxResults)) {
            const detail = await gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full'
            });

            const headers = detail.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';
            
            // Get email body
            let body = '';
            if (detail.data.payload.body.data) {
              body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
            } else if (detail.data.payload.parts) {
              const textPart = detail.data.payload.parts.find(part => part.mimeType === 'text/plain');
              if (textPart?.body.data) {
                body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
              }
            }

            emailDetails.push({
              id: message.id,
              subject,
              from,
              date,
              snippet: detail.data.snippet,
              body: body.substring(0, 500) // Limit body length
            });
          }

          return {
            success: true,
            count: emailDetails.length,
            emails: emailDetails
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    
    {
      name: 'send_email',
      description: 'Send an email via Gmail',
      parameters: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Recipient email address'
          },
          subject: {
            type: 'string',
            description: 'Email subject'
          },
          body: {
            type: 'string',
            description: 'Email body content'
          }
        },
        required: ['to', 'subject', 'body']
      },
      async execute({ to, subject, body }) {
        try {
          const message = [
            `From: "Clawdbot" <clawdbotbrattin@gmail.com>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset=utf-8`,
            ``,
            body
          ].join('\n');

          const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedMessage
            }
          });

          return {
            success: true,
            messageId: result.data.id,
            message: `Email sent successfully to ${to}`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    
    {
      name: 'read_email',
      description: 'Read the full content of a specific email by ID',
      parameters: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'The Gmail message ID'
          }
        },
        required: ['messageId']
      },
      async execute({ messageId }) {
        try {
          const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
          });

          const headers = message.data.payload.headers;
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
          const to = headers.find(h => h.name === 'To')?.value || 'Unknown';
          const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';
          
          // Get full email body
          let body = '';
          if (message.data.payload.body.data) {
            body = Buffer.from(message.data.payload.body.data, 'base64').toString('utf-8');
          } else if (message.data.payload.parts) {
            const textPart = message.data.payload.parts.find(part => part.mimeType === 'text/plain');
            if (textPart?.body.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
          }

          return {
            success: true,
            email: {
              id: messageId,
              subject,
              from,
              to,
              date,
              body
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    }
  ]
};