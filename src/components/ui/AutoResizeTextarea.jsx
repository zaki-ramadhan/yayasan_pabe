"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormField } from "@/components/ui/FormField";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

const AutoResizeTextarea = React.forwardRef(
  (
    {
      className,
      error,
      isInvalid,
      minRows = 3,
      maxRows = 10,
      value,
      defaultValue,
      onChange,
      onResize,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef(null);
    const formContext = useFormField();

    const hasError =
      isInvalid !== undefined
        ? Boolean(isInvalid)
        : error !== undefined
        ? Boolean(error)
        : formContext?.isInvalid || false;

    const [uncontrolledVal, setUncontrolledVal] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const activeValue = isControlled ? value : uncontrolledVal;

    useAutoResizeTextarea({
      ref: innerRef,
      value: activeValue,
      minRows,
      maxRows,
      onResize,
    });

    const setRefs = React.useCallback(
      (node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const handleChange = (e) => {
      if (!isControlled) {
        setUncontrolledVal(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <textarea
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={hasError ? "true" : undefined}
        className={cn(
          "flex w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          hasError
            ? "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500"
            : "border-slate-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-slate-950",
          className
        )}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
