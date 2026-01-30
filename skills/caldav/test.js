import ical from 'node-ical';

const config = {
    url: process.env.CALDAV_URL || "https://caldav.icloud.com",
    username: process.env.CALDAV_USER || "jeffbrattin@hotmail.com",
    password: process.env.CALDAV_PASS || "ptzf-bvyv-kawy-jbnd"
};

async function testCalendar() {
    console.log("DEBUG: Testing iCloud connection...");
    try {
        const auth = 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64');
        
        // Added User-Agent and specific headers to mimic a real calendar app
        const options = { 
            headers: { 
                'Authorization': auth,
                'User-Agent': 'Clawdbot/2026.1.24 (Ubuntu; Linux)',
                'Accept': 'text/calendar'
            } 
        };

        const data = await ical.fromURL(config.url, options);
        const events = Object.values(data).filter(ev => ev.type === 'VEVENT');
        
        console.log(`SUCCESS: Found ${events.length} events!`);
    } catch (err) {
        console.error("ERROR TYPE:", err.message);
        if (err.message.includes("403")) {
            console.error("403 FORBIDDEN: Try using the specific 'p' server URL instead of the generic one.");
        }
    }
}
testCalendar();
