import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqProps {
  items: FaqItem[];
}

/** Accordion-driven FAQ. Single-open behaviour for tight scan-ability. */
export function Faq({ items }: FaqProps) {
  return (
    <Accordion type="single" collapsible className="w-full divide-y divide-border border-y border-border">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-b-0">
          <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
