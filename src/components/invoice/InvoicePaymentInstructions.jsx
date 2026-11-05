"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { DashedDivider } from "@/components/ui/DashedDivider";

/**
 * Transfer instructions accordion for the selected payment channel
 * @param {object} props
 * @param {string} props.channelName
 * @param {string[]} [props.instructions]
 */
export function InvoicePaymentInstructions({ channelName, instructions = [] }) {
  if (!instructions || instructions.length === 0) return null;

  return (
    <div className="space-y-1">
      <DashedDivider />
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-800 hover:no-underline pt-2.5 pb-0">
            Petunjuk Transfer {channelName}
          </AccordionTrigger>
          <AccordionContent className="pb-1 pt-2">
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
