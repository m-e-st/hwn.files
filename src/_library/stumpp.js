/**
 * 2025-02-18 - test drive by parameter
 * 2026-05-23 - logotext
 * 
 * 
 **/

/**
 * Logotext
 * 
 **/
 
 
function setLogoText(logoID) {
	switch(logoID) {
		case "www":
			if (domLogotext)	_replaceText(domLogotext, "stumpp", 3);
			if (domLogosubtext)	_replaceText(domLogosubtext, "Oranienburg", 2.4);
			break;
		case "family":
			if (domLogotext)	_replaceText(domLogotext, "familie stumpp", 2.5);
			if (domLogosubtext)	_replaceText(domLogosubtext, "Nichtöffentliche Seite", 3.5);
			break;
		case "intern":
			if (domLogotext)	_replaceText(domLogotext, "stumpp.intern", 3);
			if (domLogosubtext)	_replaceText(domLogosubtext, "Bertha-von-Suttner-Straße 16", 0);
			break;
		case "local":
			if (domLogotext)	_replaceText(domLogotext, "stumpp.local", 4.5);
			if (domLogosubtext)	_replaceText(domLogosubtext, "Bertha-von-Suttner-Straße 16", 0);
			break;
		case "develop":
			if (domLogotext)	_replaceText(domLogotext, "stumpp.develop", 2.7);
			if (domLogosubtext)	_replaceText(domLogosubtext, "Bertha-von-Suttner-Straße 16", 1);
			break;
		default:
			if (domLogotext) domLogotext.innerHTML = defaultLogotext;
			if (domLogosubtext) domLogosubtext.innerHTML = defaultLogosubtext;
	}
}

/**
 * from web.stumpp.name … picsum.js
 *
 **/

const defaultSVG = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'></svg>";
const defaultIMG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48L3N2Zz4=';
const errorMsg = "ERROR at picsum ID #"

function defaultImage(svg=false) {
	if (svg) return defaultSVG;
	return defaultIMG;
	}

function loadPicsumImageById(imageID, picsumID = undefined, imageSize=256) {
	if (! imageID) return;
	if (picsumID === undefined) picsumID = Math.floor(Math.random()*1085);
	const url = "https://picsum.photos/id/" + picsumID + "/" + imageSize
	const img = document.getElementById(imageID);
	if (! img) return;
	img.addEventListener("error", (error) => {
		error.target.setAttribute("src", defaultImage());
		error.target.setAttribute("alt", errorMsg + picsumID);
	});
	img.setAttribute("src", url);
	img.setAttribute("alt", "picsum Image #" + picsumID);
	img.setAttribute("data-pid", picsumID);
	//~ img.removeEventListener("error");
	return picsumID;
}

/** sleep with Promise ********************************************* **/


const sleep = async (milliseconds) => {
	await new Promise(resolve => setTimeout(resolve, milliseconds));
};

/**
 *
 **/

{#
	console.log ("ENVIRONMENT", "{{site.var.ENVIRONMENT}}", "expected=localhost");
	console.log ("NTFY_BEARER", "{{site.var.NTFY_BEARER}}", "expected=tk_h6txj4wf008pux63sivcl2vsbzeta");
	console.log ("TELEGRAM_TOKEN", "{{site.var.TELEGRAM_TOKEN}}", "expected=8488307078:AAGBqc8ETgEsEM15xXe_42iRr6uzZaOREuI");
	console.log ("TELEGRAM_SPRACHCAFE", "{{site.var.TELEGRAM_CHATID}}", "expected=-1002041745090");
	console.log ("TELEGRAM_ANNOUNCEMENT", "{{site.var.TELEGRAM_ANNOUNCE}}", "expected=-1003770033789");
#}

/** converts strings with umlauts for NTFY header transfer ********* **/

function encodeRFC2047(str) {
  const encoded = btoa(unescape(encodeURIComponent(str)));
  return `=?UTF-8?B?${encoded}?=`;
}

/** send via NTFY - server=push.hwn.de ***************************** **/

const sendNotification = async (test, title, body, priority, symbol) => {
	const url = (test) ? "https://push.hwn.de/announcement"
					   : "https://push.hwn.de/sprachcafe";
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Authorization': 'Bearer {{site.var.NTFY_BEARER}}',
                'Title': title,
                'Priority': priority,
                'Tags': symbol
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Network error:', error);
        return false;
    }
};



/** send via Telegram - @SprachcafeOranienburgBot ****************** **/

const messageIcons = {
	{% for symbol in ntfy.symbols %}
		"{{symbol.name}}": "{{symbol.icon}}",
	{% endfor %}
	"": "" 		// end item
};

const priorityIcons = ["✅", "📌", "{#⚠️#}", "🔴", "🆘"];
//~ const priorityIcons = [ "➊", "➋", "{#➌#}", "➍", "➍" ];


function form2message (title, body, priority=3, symbol="") {
	let result = "";
	if (title || symbol)
		result  = messageIcons[symbol]
				+ " <b><u>" + title +"</u></b> "
				+ priorityIcons[(priority-1)%5] + "\n";
	result += body;
	return result;
}

async function sendTelegramMessage(test, message) {
	const token = '{{site.var.TELEGRAM_TOKEN}}';
	const chatId = (test) ? '{{site.var.TELEGRAM_ANNOUNCEMENT}}'		// TEST
						  : '{{site.var.TELEGRAM_SPRACHCAFE}}';			// PRODUCTION
	try {

		{% if site.env %}
/* ------------------------------------------------------------------ */
/* PRODUKTION: At netlify use function to avoid CORS error			  */
/* ------------------------------------------------------------------ */

		const response = await fetch('https://sprachcafe-oranienburg.de/.netlify/functions/send-telegram', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({							// different JSON structure for netlify function !
				token: '{{site.var.TELEGRAM_TOKEN}}',
				chatId: chatId,
				message: message
			}),
		});


		{% else %}
/* ------------------------------------------------------------------ */
/* ENTWICKLUNG: In development environment (localhost) send directly  */
/* ------------------------------------------------------------------ */
		const url = `https://api.telegram.org/bot${token}/sendMessage`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chat_id: chatId,
				text: message,
				parse_mode: 'HTML' // Optional: Allows for <b>bold</b> or <i>italic</i>
			}),
		});

/* ------------------------------------------------------------------ */
		{% endif %}

		const data = await response.json();
		if (data.ok) {
			console.log('Message sent successfully!');
			return response.ok;
		} else {
			console.error('Error from Telegram:', data.description);
		}
	} catch (error) {
		console.error('Request failed:', error);
		return false;
	}
}
