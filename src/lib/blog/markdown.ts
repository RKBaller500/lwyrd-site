// Dependency-free markdown-lite helpers shared by the public blog and the
// admin editor preview. Supports headings (##, ###, ####), bold, italic,
// inline code, links, blockquotes, horizontal rules, and both unordered (-, *)
// and ordered (1.) lists. Content is authored and stored as plain markdown.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Slug used for heading anchor ids so a table of contents can link to sections.
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function renderInline(text: string): string {
  let out = escapeHtml(text.trim());

  // Inline code `code` — protect its contents from the other inline rules by
  // stashing it behind a sentinel token (@@CODEn@@ can't occur in escaped text).
  const codes: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_m, c) => {
    codes.push("<code>" + c + "</code>");
    return "@@CODE" + (codes.length - 1) + "@@";
  });

  // links [text](url) — external (http/https) open in a new tab; in-page
  // anchors (#…) and site-relative (/…) links stay in the same tab. This lets
  // authors build a table of contents that jumps to heading anchors.
  out = out.replace(
    /\[([^\]]+)\]\((#[^\s)]+|\/[^\s)]*|https?:\/\/[^\s)]+)\)/g,
    (_m, label, href) => {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + href + '"' + attrs + ">" + label + "</a>";
    }
  );
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic *text*
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  // restore inline code
  out = out.replace(/@@CODE(\d+)@@/g, (_m, i) => codes[Number(i)] ?? "");
  return out.replace(/\n/g, " ");
}

// A small, safe markdown renderer producing HTML for the `.prose-blog` styles.
export function renderMarkdown(md: string): string {
  if (!md) return "";

  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");

    // Headings — h2 / h3 / h4 (single-line blocks)
    const heading = block.match(/^(#{2,4})\s+(.+)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length; // 2, 3, or 4
      const inner = renderInline(heading[2]);
      html.push("<h" + level + ' id="' + headingId(heading[2]) + '">' + inner + "</h" + level + ">");
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(block)) {
      html.push("<hr />");
      continue;
    }

    // Blockquote — every line starts with >
    if (lines.every((l) => /^\s*>\s?/.test(l))) {
      const inner = renderInline(lines.map((l) => l.replace(/^\s*>\s?/, "")).join("\n"));
      html.push("<blockquote>" + inner + "</blockquote>");
      continue;
    }

    // Ordered list — every line starts with `1.`, `2.`, …
    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      const items = lines
        .map((l) => "<li>" + renderInline(l.replace(/^\s*\d+\.\s+/, "")) + "</li>")
        .join("");
      html.push("<ol>" + items + "</ol>");
      continue;
    }

    // Unordered list — every line starts with - or *
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = lines
        .map((l) => "<li>" + renderInline(l.replace(/^\s*[-*]\s+/, "")) + "</li>")
        .join("");
      html.push("<ul>" + items + "</ul>");
      continue;
    }

    html.push("<p>" + renderInline(block) + "</p>");
  }

  return html.join("\n");
}

// Extract the heading outline (h2/h3) for building a table of contents.
export function extractHeadings(md: string): { level: number; text: string; id: string }[] {
  if (!md) return [];
  const out: { level: number; text: string; id: string }[] = [];
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      const text = m[2].trim();
      out.push({ level: m[1].length, text, id: headingId(text) });
    }
  }
  return out;
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
