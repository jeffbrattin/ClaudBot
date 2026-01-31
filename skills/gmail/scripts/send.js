#!/usr/bin/env node
const { google } = require('googleapis');
const { authenticate } = require('./auth');

async function sendEmail(to, subject, body, html) {
  const auth = await authenticate();
  const gmail = google.gmail({ version: 'v1', auth });

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    html ? 'Content-Type: text/html; charset=utf-8' : 'Content-Type: text/plain; charset=utf-8',
    '',
    html || body,
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', result.data.id);
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error.message);
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

  const to = getArg('--to');
  const subject = getArg('--subject');
  const body = getArg('--body');
  const html = getArg('--html');

  if (!to || !subject || (!body && !html)) {
    console.error('Usage: node send.js --to EMAIL --subject SUBJECT --body TEXT');
    console.error('   or: node send.js --to EMAIL --subject SUBJECT --html HTML');
    process.exit(1);
  }

  sendEmail(to, subject, body, html).catch(console.error);
}

module.exports = { sendEmail };
