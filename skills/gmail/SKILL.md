---
name: gmail
description: Send, read, search, and manage Gmail messages using the Gmail API via Node.js. Use when the user asks to send emails, check their inbox, search for messages, read specific emails, manage labels, or perform any Gmail-related tasks.
---

# Gmail Skill

This skill enables Gmail operations through the Gmail API using Node.js and the googleapis package.

## Quick Start

### Authentication Setup

Before using this skill, you need to set up Gmail API credentials:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download the credentials JSON file
6. Save it as `~/.openclaw/gmail-credentials.json`

Run the authentication script once to authorize:
```bash
node scripts/auth.js
```

This will open a browser window for authorization and save your token to `~/.openclaw/gmail-token.json`.

## Core Operations

### Send Email
```bash
node scripts/send.js --to "recipient@example.com" --subject "Subject" --body "Message body"
```

With HTML body:
```bash
node scripts/send.js --to "recipient@example.com" --subject "Subject" --html "<h1>Hello</h1><p>Message</p>"
```

### Read Recent Messages

List the 10 most recent messages:
```bash
node scripts/list.js --max 10
```

### Search Messages

Search by query:
```bash
node scripts/search.js --query "from:sender@example.com subject:important"
```

Common search patterns:
- `from:user@example.com` - From specific sender
- `to:user@example.com` - To specific recipient
- `subject:keyword` - Subject contains keyword
- `is:unread` - Unread messages
- `has:attachment` - Messages with attachments
- `after:2024/01/01` - Messages after date
- `label:important` - Messages with label

### Read Specific Message

Get full message details by ID:
```bash
node scripts/read.js --id "MESSAGE_ID"
```

### Reply to Message
```bash
node scripts/reply.js --id "MESSAGE_ID" --body "Reply text"
```

## Advanced Features

For complete Gmail API documentation and advanced use cases, see:
- **API Reference**: [references/api-guide.md](references/api-guide.md)
- **Authentication Details**: [references/auth-setup.md](references/auth-setup.md)

## Error Handling

If you encounter authentication errors:
1. Delete `~/.openclaw/gmail-token.json`
2. Run `node scripts/auth.js` again to re-authorize

If API quota errors occur, wait a few minutes before retrying.
