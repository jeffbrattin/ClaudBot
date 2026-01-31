#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = path.join(process.env.HOME, '.openclaw', 'gmail-token.json');
const CREDENTIALS_PATH = path.join(process.env.HOME, '.openclaw', 'gmail-credentials.json');

async function authenticate() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id } = credentials.installed || credentials.web;
    
    // Use urn:ietf:wg:oauth:2.0:oob for manual code entry
    const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      'urn:ietf:wg:oauth:2.0:oob'
    );

    // Check if we already have a token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
      console.log('Already authenticated. Token loaded from:', TOKEN_PATH);
      return oAuth2Client;
    }

    // Get new token
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n=================================================');
    console.log('Authorize this app by visiting this URL:');
    console.log('\n' + authUrl + '\n');
    console.log('=================================================\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        resolve(code);
      });
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Save token
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('\nToken saved to:', TOKEN_PATH);
    console.log('Authentication successful!');

    return oAuth2Client;
  } catch (error) {
    console.error('Error during authentication:', error.message);
    if (error.message.includes('ENOENT')) {
      console.error('\nCredentials file not found at:', CREDENTIALS_PATH);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  authenticate().catch(console.error);
}

module.exports = { authenticate, TOKEN_PATH, CREDENTIALS_PATH };
