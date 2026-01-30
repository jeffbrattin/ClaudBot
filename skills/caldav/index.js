// ~/ClaudBot/skills/caldav/index.js

const tsdav = require('tsdav'); // npm install tsdav

module.exports = {
  name: 'caldav',
  description: 'Access CalDAV calendars (iCloud, Nextcloud, etc.)',

  async init(config) {
    // config from skill or env: url, username, password
    this.client = await tsdav.createDAVClient({
      serverUrl: config.url || process.env.CALDAV_URL,
      credentials: {
        username: config.username || process.env.CALDAV_USERNAME,
        password: config.password || process.env.CALDAV_PASSWORD,
      },
      authMethod: 'Basic', // or 'Digest'
      defaultAccountType: 'caldav',
    });

    console.log('CalDAV client ready');
  },

  // Example tool: list upcoming events
  tools: [
    {
      name: 'get_events',
      description: 'Fetch recent/upcoming calendar events',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Look ahead days (default 7)' }
        }
      },
      async execute({ days = 7 }) {
        const calendars = await this.client.findCalendars();
        const events = await this.client.fetchCalendarObjects({
          calendar: calendars[0], // first calendar; improve later
          timeRange: {
            start: new Date(),
            end: new Date(Date.now() + days * 86400000)
          }
        });

        return events.map(e => ({
          summary: e.data.summary,
          start: e.data.start,
          end: e.data.end
        }));
      }
    }
  ]
};