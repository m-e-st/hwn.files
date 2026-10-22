const etherpad = (function () {
    const PAD_PREFIX = 'verify-';

    const validate = (padname) => {
        if (typeof padname !== 'string' || !/^[A-Za-z0-9_.-]{1,40}$/.test(padname)) {
            throw new Error('Invalid padname');
        }
        return padname;
    };

    {% if site.env %}
    /* ------------------------------------------------------------------ */
    /* PRODUKTION: Auf Netlify (ruft die sichere Serverless Function auf) */
    /* ------------------------------------------------------------------ */
	async function createPad(padname) {
        const cleanName = validate(padname);
        const url = '/.netlify/functions/createpad';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ padname: cleanName }),
            });

            const responseText = await response.text();
            
            // Prüfen, ob die Netlify Function einen HTTP-Fehler zurückgibt
            if (!response.ok) {
                throw new Error(`Netlify Error (${response.status}): ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log('Erfolgreich erstellt:', data);
            return data;
        } catch (error) {
            console.error('Fehler beim Erstellen des Pads:', error);
            throw error;
        }
    }

    {% else %}
    /* ------------------------------------------------------------------ */
    /* ENTWICKLUNG: Lokaler Direktzugriff mit neuer Environment-Struktur  */
    /* ------------------------------------------------------------------ */
    async function createPad(padname) {
        const cleanName = validate(padname);
        
        // PAD_URL und PAD_CREATE sauber ohne doppelte Slashes verknüpfen
        //~ const padUrl = '{{ site.var.PAD_URL }}';
        //~ const padCreate = '{{ site.var.PAD_CREATE }}';
        //~ const url = `${padUrl.replace(/\/$/, '')}/${padCreate.replace(/^\//, '')}`;
        const url = "{{ site.var.PAD_APICREATE }}";
        const padApiKey = '{{ site.var.PAD_APIKEY }}';

        const params = new URLSearchParams({
            apikey: padApiKey,
            padID: PAD_PREFIX + cleanName
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });
console.log("URL=",url, "params=",params);
            const data = await response.json();
            console.log('Erfolgreich erstellt:', data);
            return data;
        } catch (error) {
            console.error('Fehler beim Erstellen des Pads:', error);
            throw error;
        }
    }
    {% endif %}

    return {
        create: (padname) => createPad(padname)
    };
})();
