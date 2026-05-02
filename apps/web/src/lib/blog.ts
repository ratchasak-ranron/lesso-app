/**
 * Vite glob-import of MDX posts. While `apps/web/src/blog/posts/` is empty,
 * `getPosts()` returns []. When the founder ships the first MDX file, the
 * glob picks it up automatically — no manual registry.
 *
 * Frontmatter shape comes from `remark-mdx-frontmatter` (already wired in
 * `vite.config.ts`); the loader exposes it as `module.frontmatter` at runtime
 * but the type is duck-typed here. Detail route (`/blog/:slug`) lands when
 * the first post lands — out of scope for the empty scaffold.
 */
export interface BlogPost {
  slug: string;
  title: string;
  /** Short summary surfaced on the index. Optional in frontmatter; the
   *  loader passes through `undefined` when the post omits it. */
  description?: string;
  publishedAt: string;
  locale: 'en' | 'th';
}

interface MdxModule {
  frontmatter?: Partial<BlogPost>;
}

const POSTS = import.meta.glob<MdxModule>('../blog/posts/**/*.mdx', { eager: true });

export function getPosts(locale: 'en' | 'th'): BlogPost[] {
  const all: BlogPost[] = [];
  for (const mod of Object.values(POSTS)) {
    const fm = mod.frontmatter;
    if (!fm?.slug || !fm.title || !fm.locale || !fm.publishedAt) continue;
    if (fm.locale !== locale) continue;
    all.push({
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      publishedAt: fm.publishedAt,
      locale: fm.locale,
    });
  }
  return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
