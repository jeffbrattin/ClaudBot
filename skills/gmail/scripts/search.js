#!/usr/bin/env node
const { listMessages } = require('./list');

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const query = getArg('--query');
  const maxResults = parseInt(getArg('--max')) || 10;

  if (!query) {
    console.error('Usage: node search.js --query "search terms"');
    console.error('Example: node search.js --query "from:example@gmail.com is:unread"');
    process.exit(1);
  }

  listMessages(maxResults, query).catch(console.error);
}
