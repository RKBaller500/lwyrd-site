// Dependency-free markdown-lite helpers shared by the public blog and the
// admin editor preview. Supports headings (##, ###), bold, italic, links,
// horizontal rules, and unordered lists. Content is authored and stored as
// plain markdown text.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A small, safe markdown renderer producing HTML for the `.lwyrd-prose` styles.
export function renderMarkdown(md: string): string {
  if (!md) return "";

  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];

  const renderInline = (text: string): string => {
    let out = escapeHtml(text.trim());
    // links [text](url)
    out = out.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    // bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // italic *text*
    out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    return out.replace(/\n/g, " ");
  };

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (/^###\s+/.test(block)) {
      html.push(`<h3>${renderInline(block.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(block)) {
      html.push(`<h2>${renderInline(block.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^---+$/.test(block)) {
      html.push("<hr />");
      continue;
    }
    // unordered list
    if (block.split("\n").every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = block
        .split("\n")
        .map((l) => `<li>${renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>`)
        .join("");
      html.push(`<ul>${items}</ul>`);
      continue;
    }
    html.push(`<p>${renderInline(block)}</p>`);
  }

  return html.join("\n");
}

// Estimate reading time from markdown word count (~200 wpm).
export function readingTimeMinutes(md: string): number {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// URL-safe slug from a title.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
