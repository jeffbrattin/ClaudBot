const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Your Google Client ID and Secret

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const REDIRECT_URI = 'http://clawdbot.wonparent.com:3000/auth/callback';

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

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
    scope: ['https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'  
    ],});
  res.redirect(REDIRECT_URI);
});

// Handle the OAuth 2.0 server response
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await client.getToken(code);
    console.log('Tokens:', tokens); // Log tokens to debug
    await getUserProfile(tokens);
    res.json(tokens);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Authentication failed');
  }
});

// Function to fetch user profile
async function getUserProfile(tokens) {
  const { access_token } = tokens;
  
  const response = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  console.log('User Profile:', response.data);
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});