import { PageIntro } from './page-intro';
import { Section } from './section';

export interface LegalSection {
  id: string;
  heading: string;
  body: string;
}

interface LegalDocProps {
  eyebrow: string;
  heading: string;
  draftLabel: string;
  lastUpdated: string;
  sections: ReadonlyArray<LegalSection>;
}

/**
 * Shared shell for `/privacy` and `/terms`. DRAFT banner uses the secondary
 * (terracotta) brand token at low opacity — fits the editorial palette
 * without inventing a one-off `warning` token.
 */
export function LegalDoc({ eyebrow, heading, draftLabel, lastUpdated, sections }: LegalDocProps) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} heading={heading} sub={lastUpdated} />
      <div className="mx-auto max-w-3xl px-6 pb-4">
        <div
          role="note"
          className="border-l-4 border-secondary bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary"
        >
          {draftLabel}
        </div>
      </div>
      {sections.map((s) => (
        <Section key={s.id} id={s.id} heading={s.heading}>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {s.body}
          </p>
        </Section>
      ))}
    </>
  );
}
