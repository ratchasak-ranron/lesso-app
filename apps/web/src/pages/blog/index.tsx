import { PageSeo } from '@/components/seo/page-seo';
import { PageIntro } from '@/components/marketing/page-intro';
import { Section } from '@/components/marketing/section';
import { useResolvedLocale } from '@/lib/use-locale';
import { getPosts } from '@/lib/blog';

export function BlogIndexPage() {
  const { locale, t } = useResolvedLocale();
  const posts = getPosts(locale);

  return (
    <>
      <PageSeo
        title={t('meta.blog.title')}
        description={t('meta.blog.description')}
        path="/blog"
        locale={locale}
      />
      <PageIntro
        eyebrow={t('blog.intro.eyebrow')}
        heading={t('blog.intro.heading')}
        sub={t('blog.intro.sub')}
      />
      {posts.length === 0 ? (
        <Section id="blog-empty">
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('blog.empty')}
          </p>
        </Section>
      ) : (
        <Section id="blog-posts" heading={t('blog.intro.heading')}>
          <ul className="space-y-6">
            {posts.map((p) => (
              <li key={p.slug}>
                <a
                  href={`/${locale}/blog/${p.slug}`}
                  className="group block transition-colors"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                    {p.publishedAt}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-foreground group-hover:text-primary">
                    {p.title}
                  </h3>
                  {p.description ? (
                    <p className="mt-2 text-muted-foreground">{p.description}</p>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
