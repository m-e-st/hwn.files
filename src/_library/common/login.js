/**
 * login.js - Login Seite für statische Seiten
 *
 * 11.08.2023 created 
 * 07.01.2024 stumpp.name 
 * 13.01.2024 logon returns true on success, false on failure 
 * 21.03.2025 user_data is now included from -/_data/user.js (see javascript.njk)
 * 13.04.2ß25 trim of username
 * 21.04.2025 sjcl.js + sha256 + hashed user names
 * 08.05.2025 hash(), encrypt(), decrypt()
 * 08.05.2025 date limit of genAuth
 */

 
const user =(function () {
	const genAuth = _hash("{{ site.secret|d('Familie Stumpp 2024') }}", "{{ site.title|d('eleventy') }}");
	let userCode = "not given";	// version 2 only
	
	function _hash(textToHash = 'Familie Stumpp 2024', salt='') {
		{% if versionOne %}
		const hashObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8"} );
		hashObj.update(textToHash);
		return hashObj.getHash("B64");
		{% else %}
		const hash = sjcl.hash.sha256.hash(textToHash+salt);
		return sjcl.codec.base64.fromBits(hash);
		{% endif %}
	}

	function _encrypt(textToCrypt, password="ThisIsMySecret") {
		if (textToCrypt.length < 33) {
			textToCrypt += String.fromCharCode(0) + password;
			textToCrypt = textToCrypt.slice(0, 33);
		}
		return btoa(_xor(textToCrypt, password));
	}

	function _decrypt(cryptedBase64, password="ThisIsMySecret") {
		const cryptedText = atob(cryptedBase64);
		const rawText = _xor(cryptedText, password);
		const pos = rawText.indexOf(String.fromCharCode(0));
		if (pos >= 0) return rawText.slice(0, pos);
		return rawText;
	}

	function _xor(input, key) {
		let output = '';
		for (let i = 0; i < input.length; i++) {
			const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
			output += String.fromCharCode(charCode);
		}
		return output;
	}

	function _epochDay() { return parseInt(Date.now() / (24*3600*1000)); }
	
	function _search(username='') {
		const name = username.trim().toLocaleLowerCase();
		let passwordHash = '';
		{% if versionOne %}
		for (let i = 0; i < user_data.length; i++)
			if (name.localeCompare(user_data[i].name) == 0) {
				hash = user_data[i].hash;
				break;
			}
		{% else %}
		const userHash = _hash(name, "");
		for (let i = 0; i < user_data.length; i++) {
			if (userHash.localeCompare(user_data[i].user) == 0) {
				passwordHash = user_data[i].hash;
				userCode = _decrypt(user_data[i].code, _xor(userHash, name));  
				//~ console.log ("_search success", username, passwordHash, userCode);
				break;
			}
		}
		{% endif %}
		return passwordHash;
	}
	
	function _stash(cmd, username='',password='') {
		const __user__="user.name";
		const __hash__="user.hash";
		const __date__="user.date";
		const __code__="user.code";
		switch(cmd) {
			case 'set':
				const found = _search(username);
				if (found) {
					if (found == _hash(password)) {
						sessionStorage.setItem(__hash__, genAuth);
						sessionStorage.setItem(__user__, username);
						sessionStorage.setItem(__date__, _epochDay());
						sessionStorage.setItem(__code__, userCode);		// set by _search if user found
					}
				}
				return false;
			case 'get':
				if (! sessionStorage.getItem(__hash__)) return '';
				if (sessionStorage.getItem(__hash__) != genAuth) return '';
				if (sessionStorage.getItem(__date__) < (_epochDay() - 30)) return ''; // genAuth is valid 30 days only
				return sessionStorage.getItem(__user__);
			case 'del':
				sessionStorage.removeItem(__hash__);
				sessionStorage.removeItem(__user__);
				sessionStorage.removeItem(__date__);
				sessionStorage.removeItem(__code__);
				userCode = "deleted";
				return true;
			case 'code':
				if (! sessionStorage.getItem(__hash__)) return '';
				if (sessionStorage.getItem(__hash__) != genAuth) return '';
				if (sessionStorage.getItem(__date__) < (_epochDay() - 30)) return ''; // genAuth is valid 30 days only
				return sessionStorage.getItem(__code__);
			}
		return 'error: ' + cmd;
	}
	
	return {
		logon:	 function(username, password) { return _stash('set', username, password); },
		logoff:	 function() { return _stash('del'); },
		name:	 function() { return _stash("get"); },
		code:	 function() { return _stash("code"); }, 
		status:	 function() { return (_stash("get").length > 0); },
		
		hash:	 function(textToHash, salt="") { return _hash(textToHash, salt=""); },
		vernam:  function(textToXor, password) { return _xor(textToXor, password); },
		encrypt: function(textToCrypt, password) { return _encrypt(textToCrypt, password); },
		decrypt: function(cryptedBase64, password)  { return _decrypt(cryptedBase64, password); },
		
		version: function() { return "2.0"; }
    }
}());
 
 
