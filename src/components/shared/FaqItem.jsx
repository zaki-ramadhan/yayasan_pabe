import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { cn } from "@/lib/utils";

/**
 * Standardized single FAQ item for accordion lists
 *
 * @param {object} props
 * @param {string} props.value - Unique accordion item value
 * @param {string} props.question - FAQ question text
 * @param {React.ReactNode} props.answer - FAQ answer text or node
 * @param {string} [props.className]
 */
export function FaqItem({ value, question, answer, className = "" }) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "border-b-2 border-slate-200 hover:border-primary transition-colors py-1 group",
        className
      )}
    >
      <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-950 group-hover:text-primary py-3.5 hover:no-underline transition-colors">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-sm text-slate-800 leading-relaxed pb-3">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
