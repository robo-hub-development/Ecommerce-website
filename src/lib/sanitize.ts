import "server-only";
import sanitizeHtml from "sanitize-html";

/** Allow-list for blog bodies: structure, text formatting, links, images. No scripts, styles or event handlers. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "hr", "ul", "ol", "li", "strong", "em", "b", "i", "a", "blockquote", "code", "pre", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
}
