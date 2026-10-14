/***
 * main.js für stumpp intern
 * 
 * 28.03.2026 - adapted from sprachcafe
 * 06.04.2026 - outerhtml + reload on logoff
 * 07.04.2026 - changeable Logotext and ~subtext
 * 11.04-2026 - startsWithEmoji
 */
 
 /* das sind die beiden Buttons oben links im Header */
const buttonLogin = document.getElementById('layoutLogin');
const buttonMail = document.getElementById('layoutMail');

const domLogotext    = document.getElementById('layoutLogotext');
const domLogosubtext = document.getElementById('layoutLogosubtext');
let defaultLogotext = "{{ site.title | d("stumpp.intern") }}";
let defaultLogosubtext = "{{ site.description | d("Bertha-von-Suttner-Straße 16") }}";

/*** initialization on document ready ***/

document.addEventListener("DOMContentLoaded", function(event) {

	if (buttonLogin) {
		setLucideStroke(buttonLogin, 'transparent', 1);
		buttonLogin.addEventListener('click', actionLogin);
		setLucideStroke(buttonLogin, '#888', 1);

	}
	signIn( user.status() );
	
	if (buttonMail) {
		setLucideStroke(buttonMail, 'transparent', 1);
		buttonMail.addEventListener('click', actionMail);
		setLucideStroke(buttonMail, '#888', 1);
	}

	if (domLogotext) defaultLogotext = domLogotext.innerHTML;
	if (domLogosubtext) defaultLogosubtext = domLogosubtext.innerHTML;
	//~ console.log ("domLogotext", domLogotext.style.letterSpacing);
	//~ console.log ("domLogosubtext",domLogosubtext.style.letterSpacing);
});

function signIn(state=false) {
	const stateColor = [ '#888', '#0C0'];
	const stateStroke = [1,2];
	displayClass("unlogged", ! state);
	displayClass("loggedin", state);	
	setLucideStroke(buttonLogin, stateColor[state?1:0], stateStroke[state?1:0]);
	if (state) {
		 contentDecryption (user.code());
		 const layoutHostname = document.getElementById("layoutHostname")
		 if (layoutHostname) layoutHostname.textContent = user.name() + "@{{ site.host }}";
	 }
}

function actionLogin() {
	//~ signIn( false );
	if ( user.status() ) { user.logoff(); location.reload(); }	// reload necessary for outerHTML in decryption
	else openModal('popupLogin');
	signIn( user.status());
}

function actionMail() {
	setTimeout(function() {	setLucideStroke(buttonMail, '#F00', 2); }, 500 );		// give mail some time to react
	sendMail(	"{{ site.mail.receiver | d('507rydbp@anonaddy.com') }}",
				"{{ site.mail.subject  | d('Anfrage') }}", 
				{# "{{ site.mail.body | d('Hallo!\n\nIch habe mal eine Frage zum Sprachcafé\n\n\nBeste Grüße\n') | safe}}", #}
				"{{ site.mail.body | safe}}" || "Hallo!\n\nIch habe mal eine Frage\n\n\nBeste Grüße\n",
				true );
	setTimeout(function() {	setLucideStroke(buttonMail, '#888', 1); }, 5000 );		// give user some time to find
}

function setUserStatus() {
	status.userState = user.status();
	status.userName = user.name();
	setLucideStroke(buttonLogin, status.userState?'#6F9':'#888', status?2:1);  // was '#6F9':'#C44'
}



function _replaceText(element, text, spacing = 1) {
	if (element) {
		const oldVal = element.innerHTML;
		element.innerHTML = oldVal.replace(/^[^<]*/, text + " ");
		element.style.letterSpacing = spacing + "px";
	}
}

function logoTextReset() {
}

/** startsWithEmoji returns true, if a string starts with an emoji or similar symbol 
 **/

function startsWithEmoji(str) {
	if (!str) return false;
	const cp = str.codePointAt(0);
	return (
		(cp >= 0x1F300 && cp <= 0x1FAFF) || // main emoji blocks (faces, objects, animals, symbols...)
		(cp >= 0x2600  && cp <= 0x27BF)  || // misc symbols & dingbats (⚗️ ☀️ ✂️ ...)
		(cp >= 0x2B00  && cp <= 0x2BFF)  || // misc symbols and arrows (⬛ ⭐ ...)
		(cp >= 0x2300  && cp <= 0x23FF)  || // misc technical (⌚ ⏰ ...)
		(cp >= 0x1F1E6 && cp <= 0x1F1FF)    // regional indicators -> flags (🇩🇪 🇺🇸 ...)
	);
}

