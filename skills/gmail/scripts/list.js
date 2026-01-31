#!/usr/bin/env node
const { google } = require('googleapis');
const { authenticate } = require('./auth');

async function listMessages(maxResults = 10, query = null) {
  const auth = await authenticate();
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const params = {
      userId: 'me',
      maxResults,
    };
    
    if (query) {
      params.q = query;
    }

    const result = await gmail.users.messages.list(params);
    const messages = result.data.messages || [];

    if (messages.length === 0) {
      console.log('No messages found.');
      return [];
    }

    console.log(`Found ${messages.length} messages:\n`);

    // Get details for each message
    for (const message of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = details.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';

      console.log(`ID: ${message.id}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Date: ${date}`);
      console.log('---');
    }

    return messages;
  } catch (error) {
    console.error('Error listing messages:', error.message);
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

  const maxResults = parseInt(getArg('--max')) || 10;
  const query = getArg('--query');

  listMessages(maxResults, query).catch(console.error);
}

module.exports = { listMessages };
