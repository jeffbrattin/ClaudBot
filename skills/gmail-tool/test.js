require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const gmailSkill = require('./index.js');

async function testSkill() {
  console.log('--- Starting Manual Skill Test ---');
  
  // Find the list_emails tool from the exported skill
  const listTool = gmailSkill.tools.find(t => t.name === 'list_emails');
  
  if (!listTool) {
    console.error('Error: Could not find list_emails tool in index.js');
    return;
  }

  try {
    console.log('Executing list_emails...');
    const result = await listTool.execute({ maxResults: 5 });
    console.log('Execution Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test Failed with Error:', error);
  }
}

testSkill();
