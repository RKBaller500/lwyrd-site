"use client";

import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/home.data";
import type { BlogPost } from "@/types/blog";

function tagLabel(post: BlogPost): string {
  if (post.isWeeklyIntake) return "The Intake";
  if (post.category === "advice") return "Advice";
  if (post.category === "general") return "General";
  return "News";
}

/**
 * Home page shell. The marketing body is a ported static page; the "Resources"
 * blog section renders three hard-coded placeholder cards. When real published
 * posts exist, we swap those cards for the three most recent — keeping the exact
 * markup/styling — via the onReady hook. With no posts, the static fallback stays.
 */
export default function HomeClient({ posts }: { posts: BlogPost[] }) {
  const wireBlog = (root: HTMLElement) => {
    const container = root.querySelector<HTMLDivElement>("section.blog .posts");
    if (!container || posts.length === 0) return;

    container.replaceChildren(
      ...posts.map((post) => {
        const card = document.createElement("a");
        card.className = "post";
        card.href = `/blog/${post.slug}`;

        const imgWrap = document.createElement("div");
        imgWrap.className = "p-img";
        if (post.thumbnailImage) {
          const img = document.createElement("img");
          img.src = post.thumbnailImage;
          img.alt = post.title;
          imgWrap.appendChild(img);
        } else {
          imgWrap.style.background = post.thumbnailAccent || "#002452";
        }

        const inner = document.createElement("div");
        inner.className = "p-in";

        const meta = document.createElement("div");
        meta.className = "p-meta";
        const cat = document.createElement("span");
        cat.className = "p-cat";
        cat.textContent = tagLabel(post);
        meta.appendChild(cat);

        const h3 = document.createElement("h3");
        h3.textContent = post.title;

        const p = document.createElement("p");
        p.textContent = post.description;

        inner.append(meta, h3, p);
        card.append(imgWrap, inner);
        return card;
      })
    );
  };

  return <MarketingPageClient css={css} body={body} js={js} onReady={wireBlog} />;
}
