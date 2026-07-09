"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { submitForm } from "@/lib/formsubmit";

function tagLabel(post: BlogPost): string {
  if (post.isWeeklyIntake) return "The Intake";
  if (post.category === "advice") return "Advice";
  if (post.category === "general") return "General";
  return "News";
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "advice", label: "Advice" },
];

function PostThumb({ post }: { post: BlogPost }) {
  if (post.thumbnailImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.thumbnailImage} alt={post.title} />;
  }
  return (
    <div
      className="post-img is-accent"
      style={{
        height: "100%",
        background: post.thumbnailAccent || "#002452",
      }}
    />
  );
}

export default function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const featured = useMemo(
    () => posts.find((p) => p.isEditorsPick) ?? posts[0] ?? null,
    [posts]
  );

  const rest = useMemo(
    () => posts.filter((p) => p.slug !== featured?.slug),
    [posts, featured]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((p) => {
      const matchesFilter = filter === "all" || p.category === filter;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [rest, query, filter]);

  // newsletter form
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ msg: "Please enter your email address.", ok: false });
      return;
    }
    setSubmitting(true);
    setStatus({ msg: "Subscribing…", ok: true });
    try {
      await submitForm({
        email: email.trim(),
        formType: "Blog Subscribe",
        _subject: "New LWYRD Blog Subscriber",
        _replyto: email.trim(),
      });
      setEmail("");
      setStatus({ msg: "Thanks — you're subscribed.", ok: true });
    } catch {
      setStatus({
        msg: "Something went wrong. Please try again or email rahul@lwyrd.co.",
        ok: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="blog-hero">
        <div className="wrap inner">
          <h1>Blog</h1>
          <p>
            Practical legal guides, founder notes, and plain-English explainers
            for people and businesses deciding what to do next.
          </p>
        </div>
      </section>

      {featured ? (
        <section className="featured">
          <div className="wrap">
            <Link href={`/blog/${featured.slug}`} className="feature-link">
              <div className="feature-copy">
                <div className="meta">
                  <span className="tag">Featured</span>
                  <span>{tagLabel(featured)}</span>
                  <span>{featured.readTimeMinutes} min read</span>
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <span className="feature-read">
                  Read more <ArrowRight size={15} />
                </span>
              </div>
              <div className="feature-media">
                <PostThumb post={featured} />
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="blog-body">
        <div className="wrap">
          <div className="section-head">
            <h2>Latest resources</h2>
          </div>

          <div className="browse-tools">
            <div className="blog-search">
              <Search size={17} className="s-icon" />
              <input
                type="search"
                placeholder="Search articles…"
                aria-label="Search articles"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="filters" aria-label="Blog categories">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`filter ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="blog-empty">
              <strong>No matching articles</strong>
              Try a different search or category.
            </div>
          ) : (
            <div className="post-grid">
              {visible.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="post-card"
                >
                  <div className="post-img">
                    <PostThumb post={post} />
                  </div>
                  <div className="post-in">
                    <div className="meta">
                      <span className="tag">{tagLabel(post)}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="blog-cta">
        <div className="wrap">
          <div className="cta-panel">
            <div className="cta-copy">
              <h2>Stay updated on the latest from LWYRD</h2>
              <p>
                Get practical legal guides, product updates, and new resources
                delivered as they become available.
              </p>
            </div>
            <div>
              <form className="email-row" onSubmit={onSubscribe}>
                <input
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  Subscribe
                </button>
              </form>
              {status ? (
                <p
                  style={{
                    marginTop: ".6rem",
                    fontSize: ".85rem",
                    color: status.ok ? "#0f7a3d" : "#b42318",
                  }}
                >
                  {status.msg}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
