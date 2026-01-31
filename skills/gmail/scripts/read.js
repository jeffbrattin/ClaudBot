#!/usr/bin/env node
const { google } = require('googleapis');
const { authenticate } = require('./auth');

async function readMessage(messageId) {
  const auth = await authenticate();
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const result = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = result.data;
    const headers = message.payload.headers;

    console.log('\n=== EMAIL DETAILS ===');
    console.log('Message ID:', message.id);
    console.log('From:', headers.find(h => h.name === 'From')?.value);
    console.log('To:', headers.find(h => h.name === 'To')?.value);
    console.log('Subject:', headers.find(h => h.name === 'Subject')?.value);
    console.log('Date:', headers.find(h => h.name === 'Date')?.value);
    console.log('\n=== BODY ===');

    // Extract body
    let body = '';
    
    function getBody(payload) {
      if (payload.body.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }
      
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.parts) {
            const nested = getBody(part);
            if (nested) return nested;
          }
        }
      }
      
      return '';
    }

    body = getBody(message.payload);
    console.log(body || '(No text content)');

    return message;
  } catch (error) {
    console.error('Error reading message:', error.message);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const messageId = getArg('--id');

  if (!messageId) {
    console.error('Usage: node read.js --id MESSAGE_ID');
    process.exit(1);
  }

  readMessage(messageId).catch(console.error);
}

module.exports = { readMessage };
