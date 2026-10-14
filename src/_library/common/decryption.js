/**
 * Decryption for <ms-crypted> Tag
 * 
 * parameters
 * 	  password	- password to decrypt content
 *    errorMsg  - message displayed if decryption fails
 * 				  empty string hides crypted block on error.
 *    errorClasses - CSS class string for errorMsg
 * 
 * 06.04.2026 - outerhtml + reload on logoff
 * 15.08.2026 - querySelectorAll (instead of getElementsByTagName) to get statically all elements
 **/

function contentDecryption(password, errorMsg = "", errorClasses = "") {
	//~ console.log("content Decryption", password, errorMsg, errorClasses);
	const cryptedElements = document.querySelectorAll("ms-crypted");
	for (let i = 0; i < cryptedElements.length; i++) {
		const e = cryptedElements[i];
		const c = e.getAttribute("data-content"); 
		//~ e.style.display = "block";	
		try {
			e.outerHTML = sjcl.decrypt(password, c); 
			e.removeAttribute("data-content");	// remove only if successfully decrypted
		} catch(err) { 
			if (! errorMsg)
				 e.style.display = "none";
			else e.innerHTML = `<p class="${errorClasses}">${errorMsg}</p>`; 
		}
	}
}

/**
 * Encrytion is placed in "eleventy.config.js"
 * Make sure, "eleventy.config.js" contains …
 * 
 *		const sjcl = require("sjcl");
 * 
 *   	eleventyConfig.addPairedShortcode("crypt", function(content, password = "", classList="") { 
 * 		return `<ms-crypted style='display:none' class='${classList}' `
 * 			 + "data-content='" + sjcl.encrypt(password, content) + "'>"
 * 			 + "Content is encrypted.<br>Inhalt ist verschlüsselt.<br>El contenido está encriptado."
 * 			 + "</ms-crypted>";
 * 		});
 * 
 * This code ensures, that all content inside the shortcode will be 
 * stored crypted in the HTML output. Optional classlist is separated
 * by "," in Nunjucks and by " " in Liquid.
 * 
 * Usage:
 * 			{% crypt password %}
 *				Arbitrary content
 * 			{% endcrypt %}
 * 
 * Additionally call "contentDecryption" on DOMContentLoaded event to decrypt:
 * 
 * 			document.addEventListener("DOMContentLoaded", function(event) {	contentDecryption(password); });	
 * 
 **/

