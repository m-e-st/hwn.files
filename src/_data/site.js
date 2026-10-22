module.exports = {
	title: "apps & files",
	description: "files.hwn.de",
	caption: "files ",
	version: "0.2.0",


	mail: {
		receiver: "admin@hwn.de",
		subject: "Nachricht an den Administrator",
		body: "Hallo!\\n\\nIch habe mal eine Frage\\n\\n\\nBeste Grüße\\n"
	},

	scriptdir: "/static",
	imagedir: "/static/img",
	pagelogo: "/static/pagelogo.svg",
	pagelogotext: "Logo hwn",

	target: "hwn",

	author: {
		name: "Michael Stumpp",
		year: 2026,
		hide: false,
		mail: "mstumpp@hwn.de",
		code: "&#x6d;&#x73;&#x74;&#x75;&#x6d;&#x70;&#x70;&#x40;&#x68;&#x77;&#x6e;&#x2e;&#x64;&#x65;"
	},

	var: {
		ENVIRONMENT:			process.env.ENVIRONMENT,
		NTFY_BEARER:			process.env.NTFY_BEARER,
		PAD_APIKEY:				process.env.PAD_APIKEY,
		PAD_APICREATE:			process.env.PAD_URL + process.env.PAD_CREATE,
		PAD_PADURL:				process.env.PAD_URL + '/p'
	},

	ssg: {
		name:			"Eleventy",
		version:		process.env.ELEVENTY_VERSION,
		root:			process.env.ELEVENTY_ROOT,
		environment:	process.env.ELEVENTY_ENV
	},
	dev:  process.env.ELEVENTY_ENV === 'development',
	env:  process.env.ELEVENTY_ENV === 'production',
	host:  process.env.ENVIRONMENT || 'unknown',
	built: new Date().toISOString()
}
