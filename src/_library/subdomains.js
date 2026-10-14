/**
 * subdomains.js
 * 
 * Functions to handle calls by subdomain
 * UNDER CONSTRUCTION !
 **/

document.addEventListener('DOMContentLoaded', function() {
	
	// Get query parameters from URL
	//~ const urlParams = new URLSearchParams(window.location.search);

	const sub = getMySub(); // .toLowerCase();
	const tld = getMyTLD(); // .toLowerCase();
	console.log ("windows.location", window.location);
	console.log ("subdomain #1", sub, "TLD", tld);
	switch (sub) {
		case "main":	case "www":			setLogoText("www");		break;
		case "family":	case "www":			setLogoText("family");	break;
		case "intern":	case "www":			setLogoText("intern");	break;
		case "local":	case "www":			setLogoText("local");	break;
		default:
			if(window.location.hostname == "localhost") setLogoText("develop");
			else if(tld == "lan") setLogoText("local");
			else if(!sub) setLogoText("www");
	}
});	

/**
 * 
 **/

const getMyTLD = () => window.location.hostname.split('.').at(-1);
const getMySub = () => {
		const TLDs = new Set(['de', 'eu', 'tk', 'com', 'org', 'net', 'name', 'lan', 'io', 'dev']);
		const hostname = window.location.hostname;
		const parts = hostname.split('.');
		const domain = TLDs.has(parts.at(-1)) ? parts.slice(-2).join('.') : parts.at(-1);
		const sub = hostname.slice(0, -(domain.length + 1));
		return sub || null;
};
 
//~ const routes = new Map([
  //~ ['launcher', 'https://example.com/launcher'],
  //~ ['admin',    'https://example.com/admin'],
  //~ ['docs',     'https://example.com/docs'],
//~ ]);

//~ function getDestination(subdomain, fallback) {
  //~ return routes.get(subdomain) ?? fallback;
//~ }

//~ const removeTail = (str, tail) =>  str.endsWith(tail) ? str.slice(0, -tail.length) : str;	
//~ const removeDot = str => str.endsWith('.') ? str.slice(0, -1) : str;

//~ function subdomain(url) { 
	//~ const parts=url.split("."); 
	//~ const domain = TLDs.has(parts.at(-1)) ? parts.slice(-2).join('.') : parts.at(-1); 
	//~ const sub = removeDot(removeTail(url, domain));
	//~ return sub || null;
//~ }

//~ function getTLD(url) {
  //~ return new URL(url).hostname.split('.').at(-1);
//~ }

