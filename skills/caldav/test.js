const ical = require('node-ical');

// Manually provided for testing (The bot usually provides these)
const config = {
    url: process.env.CALDAV_URL || "https://caldav.icloud.com",
    username: process.env.CALDAV_USER || "jeffbrattin@hotmail.com",
    password: process.env.CALDAV_PASS || "ptzf-bvyv-kawy-jbnd"
};


async function testCalendar() {
    console.log("DEBUG: Starting iCloud sync check...");
    console.log("DEBUG: Target User: " + config.username);

 try {
        // iCloud uses Basic Auth for CalDAV
        const auth = 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64');
        
        // Fetch data from iCloud
        const data = await ical.fromURL(config.url, { headers: { 'Authorization': auth } });
        
        // Filter for actual events
        const events = Object.values(data).filter(ev => ev.type === 'VEVENT');
        
        if (events.length === 0) {
            console.log("SUCCESS: Connected to iCloud, but no events were found in the response.");
        } else {
            console.log(`SUCCESS: Found ${events.length} events!`);
            // Show the first 3 for confirmation
            events.slice(0, 3).forEach(e => {
                console.log(` - ${e.summary} (${e.start})`);
            });
        }
    } catch (err) {
        console.error("CRITICAL ERROR:");
        console.error(err.message);
        if (err.message.includes("401")) {
            console.error("TIP: Your App-Specific Password was rejected. Double-check it at appleid.apple.com.");
        }
    }
}

testCalendar();