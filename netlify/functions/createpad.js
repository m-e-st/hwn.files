// netlify/functions/createPad.js
export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { padname } = JSON.parse(event.body);

        // Sicherheitsprüfung für den Padnamen
        if (typeof padname !== 'string' || !/^[A-Za-z0-9_.-]{1,40}$/.test(padname)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid padname' }) };
        }

        const padApiKey = process.env.PAD_APIKEY;
        const padUrl = process.env.PAD_URL || '';
        const padCreate = process.env.PAD_CREATE || '';
        const padPrefix = 'verify-';

        // URL sauber zusammensetzen (verhindert doppelte Schrägstriche //)
        const targetUrl = `${padUrl.replace(/\/$/, '')}/${padCreate.replace(/^\//, '')}`;

        const params = new URLSearchParams({
            apikey: padApiKey,
            padID: padPrefix + padname
        });

        const response = await fetch(targetUrl, {
            method: 'POST',
      headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
