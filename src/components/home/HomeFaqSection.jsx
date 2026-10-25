import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/components/shared/FaqItem";

/**
 * Frequently asked questions accordion on home page
 * @param {object} props
 * @param {Array} [props.faqs]
 */
export function HomeFaqSection({ faqs = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-medium text-slate-950 tracking-tight">
          Pertanyaan Umum (FAQ)
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, idx) => (
          <FaqItem
            key={idx}
            value={`faq-${idx}`}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </Accordion>
    </div>
  );
}
