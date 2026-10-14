/**	2026 stumpp | luise
 *
 *  v2.0 - 2025-02-27
 *	v2.x - 2025-05-24 - added yaml support
 *	v2.6 - 2025-05-29 js-yaml
 *	v2.7 - 2025-10-28 dotenvx
 *	v2.7.1 2026-01-08 template override
 *	v2.8 - 2026-01-15 preprocessor for markdown encryption
 *	v2.8.1 2026-01-15 markdown-it-attr and markdown-it-callout
 *	v2.9   2026-03-24 markdown-it-footnote common renderer for normal and crypt
 *	v2.9.1 2026-03-30 added filters from blog.stumpp
 *	v2.9.2 2026-04-06 crypt shortcode crypts only with nonempty password
 *	v2.9.3 2026-04-12 minor improvements
 *	v2.9.4 2026-04-21 Caption bug fixed
 *	v2.9.4 2026-06-01 "Caption"
 *	v2.9.5 2026-06-03 get-blog-content mit neuen Verzeichnissen
 *	v2.9.6 2026-06-09 markdown-it-image-size
 *	v2.9.7 2026-08-11 EmojiCaption
 *	v2.9.8 2026-09-16 wikilinks
 * 
 **/

const htmlMinifier = require ('html-minifier-terser');
const lucideIcons = require("@grimlink/eleventy-plugin-lucide-icons");
const path = require('path');															/* v2.2 */
const sjcl = require("sjcl");
const yaml = require("js-yaml");														/* v2.6 */
const markdownItAttrs = require("markdown-it-attrs");									/* v2.8.1 */
const markdownItCallouts = require("markdown-it-obsidian-callouts");					/* v2.8.1 */
const markdownItFootnote = require("markdown-it-footnote");								/* v2.8.2 */
const markdownItWikilinks = require("markdown-it-wikilinks");								/* v2.8.2 */
require('dotenv').config(); // load .env into process.env								/* v2.7 */

module.exports = function (eleventyConfig) {

let _mdlib;

eleventyConfig.amendLibrary("md", (mdLib) => {		/* v2.9 */
	_mdLib = mdLib; // speichern für späteren Zugriff
	mdLib.use(markdownItAttrs);
	mdLib.use(markdownItCallouts);
	mdLib.use(markdownItFootnote);
	//~ mdLib.use(markdownItWikilinks({
		//~ baseURL: "#",
		//~ uriSuffix: ".html",
		//~ makeAllLinksAbsolute: false, 
		//~ htmlCode: true,
		//~ generatePageNameFromLabel: (label) => { return label.toLowerCase().replace(/\s+(.)/g, (match, char) => char.toUpperCase()); }
		//~ }) 
	//~ );

//~ // Obsidian Wikilink Images: ![[files/name.png|300]] → <img>
	mdLib.core.ruler.before("normalize", "obsidian_images", (state) => {
		const regex = /!\[\[files\/([^\]|]+)(?:\|(\d+))?\]\]/g;
		state.src = state.src.replace(regex, (match, filename, width) => {
			const widthAttr = width ? ` width="${width}"` : "";
			return `\n\n<img src="/static/img/md/${filename}"${widthAttr} alt="${filename}">\n\n`;
		});
	});

  //~ // Fix footnote anchor links
	mdLib.renderer.rules.footnote_ref = (tokens, idx, options, env) => {
		const id = tokens[idx].meta.id + 1;
		const subId = tokens[idx].meta.subId;
		const suffix = subId > 0 ? `:${subId}` : "";
		const pageUrl = env?.page?.url ?? "";
		return `<sup><a href="${pageUrl}#fn${id}" id="fnref${id}${suffix}">${id}</a></sup>`;
	};

	mdLib.renderer.rules.footnote_anchor = (tokens, idx, options, env) => {
		const id = tokens[idx].meta.id + 1;
		const subId = tokens[idx].meta.subId;
		const suffix = subId > 0 ? `:${subId}` : "";
		const pageUrl = env?.page?.url ?? "";
		return ` <a href="${pageUrl}#fnref${id}${suffix}" class="footnote-backref">↩︎</a>`;
	};
	
	mdLib.renderer.rules.image = (tokens, idx) => {		/** new renderer form /static/img/md and classes inside the title **/
	  const token = tokens[idx];
	  const src = token.attrGet("src");
	  const raw = token.content;  // full alt text
	  const title = token.attrGet("title");

	  // Split alt on pipe to extract optional classes
	  const [alt, classStr] = raw.split("|").map(s => s.trim());

	  const titleAttr = title    ? ` title="${title}"` : "";
	  const classAttr = classStr ? ` class="${classStr}"` : "";

	  const newSrc = /^files\//.test(src) || !/\//.test(src)
		? src.replace(/^(files\/)?/, "/static/img/md/")
		: src;

	  return `<img src="${newSrc}" alt="${alt}"${titleAttr}${classAttr}>`;
	};
});

	/**	This Preprocessor is for markdown files with a crypt entry in its frontmatter
	 *	The crypt entry is the encryption password.
	 * 	markdown content is rendered to html and surrounded by the encryption shortcode.
	 * 	Therefore the complete markdown content is encrypted and available only to signedin users.
	 * 	Caveat:
	 * 		If the md file contains strings in processor directives (like "include")
	 * 		you have to use single quotes only to avoid conflicts with the preprocessor!
	 **/
	eleventyConfig.addPreprocessor("encryption", "md", (data, content) => {				/* v2.8 + v2.9 */
		if(data.crypt) {
			const renderedContent = _mdLib.render(content);
			return '{% crypt "'+ data.crypt +'", "w3-section" %}\n' + renderedContent +'\n{% endcrypt %}\n';
		}
	});

    eleventyConfig.addPlugin(lucideIcons);
    eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  	eleventyConfig.addShortcode("anchor", function setAnchor(anchorName) { return `<a name="${anchorName}"><br><br><hr></a>`; });
  	eleventyConfig.addPairedShortcode("crypt", function(content, password = "", classList="") {
		if (! password) return content;												/* v2.9.2 do not encrypt without password */
		return `<ms-crypted style='display:none' class='${classList}' `
			 + "data-content='" + sjcl.encrypt(password, content) + "'>"
			 + "Content is encrypted.<br>Inhalt ist verschlüsselt.<br>El contenido está encriptado."
			 + "</ms-crypted>";
	});
  	eleventyConfig.addFilter("Datum", function(value) {
		const string = value.toISOString();
		return string.slice(8,10) +'.' + string.slice(5,7) + '.' + string.slice(0,4);
	});
  	eleventyConfig.addFilter("dateTitle", function(value) {
		const token = value.split('_')[1];
		if (! token) return "ERROR 1";
		const parts = token.split('-');
		return parts[2] + '-' + parts[1] + '-' + parts[0];
	});
  	eleventyConfig.addFilter("Ascii", function(value) {
		const originalChars = "äöüÄÖÜßÑñáéíóú";
		const replacementChars = "aouAOUSNnaeiou";
		let result = value;
		for (let i = 0; i < originalChars.length;i++)
			result = result.replaceAll(originalChars[i], replacementChars[i]);
		return result;
	});
  	eleventyConfig.addFilter("Basename", function(value) {							/* v2.2 */
		let result = path.basename(value, ".html");
		return result;
	});
  	eleventyConfig.addFilter("Paragraphs", function(value) {						/* v2.2 */
		let result = "<p>" + value.replaceAll("\n", "</p>\n<p>") + "</p>"
		return result;
	});
  	eleventyConfig.addFilter("Caption", function(value) {							/* v2.8 */
		if (typeof value !== "string" || value.length === 0) return value;							
		return result = value.at(0).toLocaleUpperCase() + value.slice(1);
	});

	eleventyConfig.addFilter("EmojiCaption", function (caption, name) {				/* v2.9.5 */
		if (!caption) return name || '';

		const cp = caption.codePointAt(0);
		const isEmoji = (
			(cp >= 0x1F300 && cp <= 0x1FAFF) ||
			(cp >= 0x2600  && cp <= 0x27BF)  ||
			(cp >= 0x2B00  && cp <= 0x2BFF)  ||
			(cp >= 0x2300  && cp <= 0x23FF)  ||
			(cp >= 0x1F1E6 && cp <= 0x1F1FF)
		);
		if (isEmoji) return caption + " &nbsp; " + name;
		return caption;
	});

	eleventyConfig.addTransform ('htmlMinifier', function(content,outputPath) {
		if (	(process.env.ELEVENTY_ENV === 'production')
			&&	(outputPath)
			&&	( (outputPath.indexOf('.html') > -1) ||  (outputPath.indexOf('.css') > -1) )
		   ) {
			return htmlMinifier.minify (content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
				minifyJS: true,
				minifyCSS: true,
			});
		}
		return content;
	});


	// Folders to copy to build dir (See. 1.1)
	eleventyConfig.addPassthroughCopy("src/static/**");
	eleventyConfig.addPassthroughCopy("src/files/**");
	eleventyConfig.addPassthroughCopy("src/favicon.ico");
	eleventyConfig.addPassthroughCopy("src/.well-known/**/*");
	eleventyConfig.addPassthroughCopy("src/_headers");	

	// This allows Eleventy to watch for file changes during local development.
	//~ eleventyConfig.addWatchTarget("src/**/*.php");
	eleventyConfig.addWatchTarget("src/_library/");
	eleventyConfig.setUseGitIgnore(false);

	return {
		dir: {
			input: "src/",
			output: "public/",
			includes: "_includes",
			layouts: "_layouts"
		},
		templateFormats: ["html", "md", "njk"],
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		passthroughFileCopy: true	// 1.1 Enable eleventy to pass dirs specified above
	};
};
