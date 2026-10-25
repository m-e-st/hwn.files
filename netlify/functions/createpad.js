// netlify/functions/createPad.js
export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const padname = body.padname;

        // Sicherheitsprüfung für den Padnamen
        if (typeof padname !== 'string' || !/^[A-Za-z0-9_.-]{1,40}$/.test(padname)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid padname' }) };
        }

        const padApiKey = process.env.PAD_APIKEY;
        const padUrl = process.env.PAD_URL;
        const padCreate = process.env.PAD_CREATE;

        // Debug-Ausgaben für die Netlify Logs
        //~ console.log("DEBUG - PAD_URL:", padUrl);
        //~ console.log("DEBUG - PAD_CREATE:", padCreate);
        //~ console.log("DEBUG - APIKEY vorhanden:", !!padApiKey);
        //~ console.log("DEBUG - padname:", padname);

        if (!padApiKey || !padUrl || !padCreate) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Environment variables missing on Netlify!' }) };
        }

        const targetUrl = `${padUrl.replace(/\/$/, '')}/${padCreate.replace(/^\//, '')}`;

        const params = new URLSearchParams({
            apikey: padApiKey,
            padID: padname
        });

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const responseText = await response.text();
        //~ console.log("DEBUG - Etherpad Response:", responseText);

        return {
            statusCode: 200,
            body: responseText,
        };
    } catch (error) {
        console.error("DEBUG - Function Crash Error:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
