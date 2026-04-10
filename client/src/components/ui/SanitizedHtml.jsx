import DOMPurify from "dompurify";

/**
 * Safely renders HTML content after sanitizing with DOMPurify.
 * Use this component ONLY when HTML rendering is genuinely required
 * (e.g. rich-text editor output). For plain text, render as text nodes instead.
 */
const SanitizedHtml = ({ html, className = "", as: Tag = "div" }) => {
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "b", "i",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "hr", "span", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default SanitizedHtml;
