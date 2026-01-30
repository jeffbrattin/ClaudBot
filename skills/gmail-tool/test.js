require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


module.exports = {
  name: 'gmail-tool',
  // ... metadata ...
  tools: [
    {
      name: 'list_emails',
      async execute({ maxResults = 10, query = '' }) {
        console.log(`[Gmail Skill] Starting to list emails (max: ${maxResults}, query: "${query}")`);
        try {
          // ... existing code ...
          console.log('[Gmail Skill] Successfully fetched email list.');
          return { success: true, emails: response.data.messages };
        } catch (error) {
          console.error('[Gmail Skill] Error listing emails:', error.message);
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: 'get_email_details',
      async execute({ messageId }) {
        console.log(`[Gmail Skill] Fetching details for ID: ${messageId}`);
        try {
          // ... existing code ...
          return { success: true, email: details };
        } catch (error) {
          console.error(`[Gmail Skill] Error getting details for ${messageId}:`, error.message);
          return { success: false, error: error.message };
        }
      }
    }
  ]
};