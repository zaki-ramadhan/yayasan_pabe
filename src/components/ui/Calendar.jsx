"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      className={cn("p-3 bg-white rounded-xl", className)}
      classNames={{
        root: `${defaultClassNames.root || ""} shadow-none`,
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-8",
        caption_label: "text-sm font-semibold text-slate-900",
        nav: "w-full absolute top-1 inset-x-0 px-1 flex items-center justify-between z-20 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 text-slate-600 opacity-80 hover:opacity-100 hover:bg-slate-100 cursor-pointer pointer-events-auto"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 text-slate-600 opacity-80 hover:opacity-100 hover:bg-slate-100 cursor-pointer pointer-events-auto"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-slate-500 rounded-md w-9 font-medium text-[0.8rem] text-center",
        week: "flex w-full mt-1.5",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-lg cursor-pointer hover:bg-blue-50 hover:text-primary transition-colors aria-selected:!bg-primary aria-selected:!text-white"
        ),
        selected: "!bg-primary !text-white hover:!bg-primary hover:!text-white [&>button]:!text-white [&>button]:!bg-primary [&>button]:hover:!bg-primary [&>button]:hover:!text-white [&>button]:!font-medium rounded-lg shadow-xs",
        today: "border border-primary/40 font-medium text-primary",
        outside: "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-400",
        disabled: "text-slate-300 opacity-40 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        DayButton: ({ day, modifiers, className: _className, ...buttonProps }) => {
          const isSelected = !!modifiers?.selected;
          return (
            <button
              type="button"
              {...buttonProps}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 rounded-lg cursor-pointer transition-colors text-sm",
                isSelected
                  ? "!bg-primary !text-white hover:!bg-primary hover:!text-white focus:!bg-primary focus:!text-white !font-medium shadow-xs"
                  : "text-slate-900 hover:bg-blue-50 hover:text-primary font-normal",
                modifiers?.today && !isSelected && "border border-primary/50 text-primary font-medium",
                modifiers?.outside && "text-slate-300 opacity-50",
                modifiers?.disabled && "text-slate-300 opacity-40 pointer-events-none"
              )}
            />
          );
        },
        Chevron: ({ orientation, className: chevronClassName }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClassName)} />;
          }
          return <ChevronRight className={cn("h-4 w-4", chevronClassName)} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
