/**
 * ipinfo.js
 * 
 * Uses API of https://ipwho.de of adminforge to determine the IP address of the issuing computer
 * 
 * 11.08.2026 created (with help of https://claude.ai/share/dbddc3c6-f303-442c-8461-b270cd02960c)
 *
 **/

const ipInfo = (function () {
	let ipData = { status: false };
	let readyPromise = null;

	async function loadIpInfo() {
		try {
			const response = await fetch('https://ipwho.de/json');
			if (!response.ok) {
				throw new Error('Request failed with status ' + response.status);
			}
			const data = await response.json();

			const next = { status: true };
			Object.entries(data).forEach(([key, value]) => {
				next[key] = typeof value === 'object'
							? JSON.stringify(value)
							: String(value);
			});

			ipData = next;
		} catch (err) {
			ipData = { status: false, error: err.message };
		}
		return ipData;
	}

	document.addEventListener('DOMContentLoaded', function () {
		readyPromise = loadIpInfo();
	});

	return {
		// returns a promise resolving to the current data (waits for the initial load)
		get: () => readyPromise || loadIpInfo(),
		// forces a fresh fetch and returns a promise
		refresh: () => (readyPromise = loadIpInfo()),
	};
})();
