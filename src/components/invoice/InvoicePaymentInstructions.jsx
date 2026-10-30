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
          <AccordionTrigger className="text-sm font-medium text-slate-800 hover:no-underline py-2">
            Petunjuk Transfer {channelName}
          </AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 leading-relaxed pt-1">
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
