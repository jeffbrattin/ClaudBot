---
name: gmail-tool
description: Send, read, search, and manage Gmail emails. Use when the user asks to check inbox, read emails, send emails, or search for messages.
homepage: https://developers.google.com/gmail/api
metadata: {"clawdbot":{"emoji":"📧","requires":{"bins":["node"]}}}
---
# Gmail Tool

Manages Gmail via the Gmail API using Node.js. Scripts are in `~/ClaudBot/skills/gmail-tool/`.

## List Emails
List recent emails, optionally filtered by a query:
```bash
node ~/ClaudBot/skills/gmail-tool/index.js list --max 10
node ~/ClaudBot/skills/gmail-tool/index.js list --max 5 --query "is:unread"
node ~/ClaudBot/skills/gmail-tool/index.js list --max 5 --query "from:someone@example.com"
```

## Read Email
Read a full email by message ID:
```bash
node ~/ClaudBot/skills/gmail-tool/index.js read --id MESSAGE_ID
```

## Send Email
Send an email:
```bash
node ~/ClaudBot/skills/gmail-tool/index.js send --to "recipient@example.com" --subject "Subject" --body "Message body"
```

## Search
Common Gmail search queries:
- `is:unread` - Unread messages
- `from:user@example.com` - From a specific sender
- `subject:keyword` - Subject contains keyword
- `has:attachment` - Messages with attachments
- `after:2026/01/01` - Messages after a date
- `label:important` - Messages with a label
