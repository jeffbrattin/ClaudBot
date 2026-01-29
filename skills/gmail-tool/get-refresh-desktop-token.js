// save as get-refresh-token.js
const { google } = require('googleapis');
const fs = require('fs');

const CLIENT_ID = process.env.GOOGLE_DESKTOPCLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DESKTOPCLIENT_SECRET;
const REDIRECT_URI = 'http://localhost'; // or 'urn:ietf:wg:oauth:2.0:oob' for manual






const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://mail.google.com/' // full access if needed
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // forces refresh token
});

console.log('Authorize this app by visiting:', authUrl);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Paste the full redirect URL here: ', (url) => {
  const code = new URL(url).searchParams.get('code');
  if (!code) return console.log('No code found');

  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving token', err);
    console.log('Refresh token:', token.refresh_token);
    fs.writeFileSync('token.json', JSON.stringify(token));
    console.log('Saved to token.json');
    readline.close();
  });
});