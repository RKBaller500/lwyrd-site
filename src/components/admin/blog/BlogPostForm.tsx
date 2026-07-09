"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link2,
  List,
  Minus,
} from "lucide-react";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPostInput,
} from "@/lib/actions/admin/blog";
import { renderMarkdown, readingTimeMinutes, slugify } from "@/lib/blog/markdown";
import {
  BUSINESS_TYPE_LABELS,
  BUSINESS_FOCUS_LABELS,
} from "@/data/blogPosts";

interface Props {
  mode: "create" | "edit";
  postId?: string;
  initial?: BlogPostInput;
}

const TYPE_OPTIONS = Object.entries(BUSINESS_TYPE_LABELS);
const FOCUS_OPTIONS = Object.entries(BUSINESS_FOCUS_LABELS);

const EMPTY: BlogPostInput = {
  slug: "",
  title: "",
  description: "",
  content: "",
  authorName: "LWYRD Editorial",
  authorTitle: "",
  category: "news",
  businessTypes: [],
  businessFocus: [],
  isEditorsPick: false,
  isWeeklyIntake: false,
  thumbnailAccent: "#002452",
  thumbnailImage: "",
  status: "draft",
};

export default function BlogPostForm({ mode, postId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<BlogPostInput>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  };

  const toggle = (key: "businessTypes" | "businessFocus", value: string) => {
    setForm((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  // Wrap the current textarea selection with markdown syntax.
  const surround = (before: string, after = before, placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    set("content", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + selected.length;
    });
  };

  // Insert a line-prefix (headings, list) at the start of the current line.
  const prefixLine = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    set("content", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + prefix.length;
    });
  };

  const insertBlock = (block: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const next = value.slice(0, s) + block + value.slice(s);
    set("content", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + block.length;
    });
  };

  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);
  const readTime = readingTimeMinutes(form.content);

  const submit = (statusOverride?: "draft" | "published") => {
    setError("");
    const payload: BlogPostInput = {
      ...form,
      slug: form.slug.trim(),
      status: statusOverride ?? form.status,
    };
    if (!payload.title.trim()) {
      setError("A title is required.");
      return;
    }
    if (!payload.slug) {
      setError("A slug is required.");
      return;
    }
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createBlogPost(payload)
          : await updateBlogPost(postId!, payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    });
  };

  const remove = () => {
    if (!postId) return;
    if (
      !window.confirm(
        `Delete “${form.title}”? This permanently removes the post and cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteBlogPost(postId, form.slug);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    });
  };

  return (
    <div className="adm-form">
      {error ? <div className="adm-error">{error}</div> : null}

      <div className="adm-form-grid with-preview">
        {/* Left: content editor */}
        <div>
          <div className="adm-field">
            <label className="adm-label">Title</label>
            <input
              className="adm-input"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="A clear, specific headline"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Slug (URL)</label>
            <input
              className="adm-input"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              placeholder="a-clear-specific-headline"
            />
            <p className="adm-hint">
              lwyrd.co/blog/<strong>{form.slug || "your-slug"}</strong>
            </p>
          </div>

          <div className="adm-field">
            <label className="adm-label">Excerpt / description</label>
            <textarea
              className="adm-textarea"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="A one or two sentence summary shown on cards and at the top of the post."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">
              Content{" "}
              <span style={{ color: "var(--faint)", fontWeight: 500 }}>
                · {readTime} min read
              </span>
            </label>
            <div className="adm-editor">
              <div className="adm-editor-bar">
                <button type="button" className="adm-editor-btn" title="Bold" onClick={() => surround("**")}>
                  <Bold size={15} />
                </button>
                <button type="button" className="adm-editor-btn" title="Italic" onClick={() => surround("*")}>
                  <Italic size={15} />
                </button>
                <span className="adm-editor-sep" />
                <button type="button" className="adm-editor-btn" title="Heading 2" onClick={() => prefixLine("## ")}>
                  <Heading2 size={15} />
                </button>
                <button type="button" className="adm-editor-btn" title="Heading 3" onClick={() => prefixLine("### ")}>
                  <Heading3 size={15} />
                </button>
                <button type="button" className="adm-editor-btn" title="List item" onClick={() => prefixLine("- ")}>
                  <List size={15} />
                </button>
                <span className="adm-editor-sep" />
                <button
                  type="button"
                  className="adm-editor-btn"
                  title="Link"
                  onClick={() => surround("[", "](https://)", "link text")}
                >
                  <Link2 size={15} />
                </button>
                <button
                  type="button"
                  className="adm-editor-btn"
                  title="Divider"
                  onClick={() => insertBlock("\n\n---\n\n")}
                >
                  <Minus size={15} />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"Write in Markdown.\n\n## A section heading\n\nA paragraph of body text. Use **bold**, *italic*, and [links](https://example.com).\n\n- A bullet point\n- Another point"}
              />
            </div>
            <p className="adm-hint">
              Supports Markdown: ## / ### headings, **bold**, *italic*,
              [links](url), - lists, and --- dividers.
            </p>
          </div>
        </div>

        {/* Right: live preview */}
        <div>
          <div className="adm-preview">
            <div className="adm-preview-label">Live preview</div>
            {form.title ? (
              <h1
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {form.title}
              </h1>
            ) : null}
            {form.description ? (
              <p style={{ color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                {form.description}
              </p>
            ) : null}
            {form.content ? (
              <div
                className="prose-blog"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p style={{ color: "var(--faint)", fontSize: "0.88rem" }}>
                Start writing to see a live preview of your article.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="adm-card">
        <div className="adm-card-title">Post settings</div>
        <div className="adm-card-sub">
          Author, category, audience, and how the post appears.
        </div>

        <div className="adm-row">
          <div className="adm-field">
            <label className="adm-label">Author name</label>
            <input
              className="adm-input"
              value={form.authorName}
              onChange={(e) => set("authorName", e.target.value)}
              placeholder="LWYRD Editorial"
            />
          </div>
          <div className="adm-field">
            <label className="adm-label">Author title (optional)</label>
            <input
              className="adm-input"
              value={form.authorTitle}
              onChange={(e) => set("authorTitle", e.target.value)}
              placeholder="Co-Founder"
            />
          </div>
        </div>

        <div className="adm-row" style={{ marginTop: 16 }}>
          <div className="adm-field">
            <label className="adm-label">Category</label>
            <select
              className="adm-select"
              value={form.category}
              onChange={(e) => set("category", e.target.value as BlogPostInput["category"])}
            >
              <option value="news">News</option>
              <option value="advice">Advice</option>
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Status</label>
            <select
              className="adm-select"
              value={form.status}
              onChange={(e) => set("status", e.target.value as BlogPostInput["status"])}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="adm-field" style={{ marginTop: 16 }}>
          <label className="adm-label">Audience — business types</label>
          <div className="adm-chips">
            {TYPE_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`adm-chip ${form.businessTypes.includes(value) ? "is-on" : ""}`}
                onClick={() => toggle("businessTypes", value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-field" style={{ marginTop: 16 }}>
          <label className="adm-label">Audience — focus areas</label>
          <div className="adm-chips">
            {FOCUS_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`adm-chip ${form.businessFocus.includes(value) ? "is-on" : ""}`}
                onClick={() => toggle("businessFocus", value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-row" style={{ marginTop: 16 }}>
          <div className="adm-field">
            <label className="adm-label">Cover image URL (optional)</label>
            <input
              className="adm-input"
              value={form.thumbnailImage}
              onChange={(e) => set("thumbnailImage", e.target.value)}
              placeholder="https://images.unsplash.com/…"
            />
          </div>
          <div className="adm-field">
            <label className="adm-label">Accent color</label>
            <input
              type="text"
              className="adm-input"
              value={form.thumbnailAccent}
              onChange={(e) => set("thumbnailAccent", e.target.value)}
              placeholder="#002452"
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr 1fr",
            marginTop: 16,
          }}
        >
          <label className="adm-check">
            <input
              type="checkbox"
              checked={form.isEditorsPick}
              onChange={(e) => set("isEditorsPick", e.target.checked)}
            />
            <span>
              <span className="adm-check-t">Editor&apos;s pick</span>
              <span className="adm-check-s">Highlight this post on the blog.</span>
            </span>
          </label>
          <label className="adm-check">
            <input
              type="checkbox"
              checked={form.isWeeklyIntake}
              onChange={(e) => set("isWeeklyIntake", e.target.checked)}
            />
            <span>
              <span className="adm-check-t">The Intake</span>
              <span className="adm-check-s">Mark as a weekly Intake column.</span>
            </span>
          </label>
        </div>
      </div>

      <div className="adm-form-actions">
        <button
          type="button"
          className="adm-btn adm-btn-primary"
          disabled={isPending}
          onClick={() => submit("published")}
        >
          {isPending ? "Saving…" : "Save & publish"}
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-ghost"
          disabled={isPending}
          onClick={() => submit("draft")}
        >
          Save as draft
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-ghost"
          disabled={isPending}
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            className="adm-btn adm-btn-danger"
            style={{ marginLeft: "auto" }}
            disabled={isPending}
            onClick={remove}
          >
            Delete post
          </button>
        ) : null}
      </div>
    </div>
  );
}
