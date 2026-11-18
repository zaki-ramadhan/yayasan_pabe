import * as React from "react";
import { FormattedNumberInput } from "./FormattedNumberInput";

/**
 * Currency input with "Rp" prefix and thousand separators.
 */
export function CurrencyInput({ prefix = "Rp", ...props }) {
  return <FormattedNumberInput prefix={prefix} {...props} />;
}
