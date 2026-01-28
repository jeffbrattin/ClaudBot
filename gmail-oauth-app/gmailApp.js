require('dotenv').config();
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://clawdbot.wonparent.com:3000/auth/callback';

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set!');
  console.error('Make sure you have a .env file with these values');
  process.exit(1);
}

console.log('✓ CLIENT_ID loaded');
console.log('✓ CLIENT_SECRET loaded');
console.log('✓ REDIRECT_URI:', REDIRECT_URI);

// Middleware for Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src *; script-src * 'unsafe-inline' 'unsafe-eval';");
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Gmail OAuth App</h1><a href="/auth/google">Authenticate with Google</a>');
});

// Redirect to Gmail's OAuth 2.0 server
app.get('/auth/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'  
    ],
  });
  res.redirect(authUrl);
});

// Handle the OAuth 2.0 server response
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await client.getToken(code);
    console.log('Tokens:', tokens);
    
    // Get user profile
    await getUserProfile(tokens);
    
    // Send test email
    await sendEmail(
      tokens, 
      'jeffbrattin@gmail.com', 
      'Test email from Clawdbot', 
      'This is a test email sent from Clawdbot using Gmail API!'
    );
    
    res.send('<h1>Authentication successful!</h1><p>Check your email and server logs.</p>');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Authentication failed');
  }
});

// Function to fetch user profile
async function getUserProfile(tokens) {
  const { access_token } = tokens;
  
  try {
    const response = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log('User Profile:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// Function to get user emails
async function getUserEmails(tokens) {
  const { access_token } = tokens;

  try {
    const emailsResponse = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log('Emails:', emailsResponse.data);
    return emailsResponse.data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

// Function to send email
async function sendEmail(tokens, to, subject, messageBody) {
  const { access_token } = tokens;

  // IMPORTANT: Use the actual authenticated email address
  const message = [
    `From: "Clawdbot" <clawdbotbrattin@gmail.com>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    messageBody
  ].join("\n");

  // Encode to base64url format (Gmail API requirement)
  const base64EncodedEmail = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const sendResponse = await axios.post(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      { raw: base64EncodedEmail },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✓ Email sent successfully!', sendResponse.data);
    return sendResponse.data;
  } catch (error) {
    console.error('✗ Error sending email:', error.response?.data || error.message);
    throw error;
  }
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Visit http://clawdbot.wonparent.com:3000 to start`);
});