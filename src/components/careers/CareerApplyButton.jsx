import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DEFAULT_APPLY_URL = "https://forms.gle/pabe-recruitment";

/**
 * Atomic component: Standardized application CTA button pointing to Google Form
 * @param {object} props
 * @param {string} [props.url]
 * @param {string} [props.label="Lamar Posisi Ini"]
 * @param {boolean} [props.fullWidthMobile=false]
 * @param {string} [props.className]
 */
export function CareerApplyButton({
  url = DEFAULT_APPLY_URL,
  label = "Lamar Posisi Ini",
  fullWidthMobile = false,
  className = "",
  onClick,
}) {
  if (onClick) {
    return (
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "h-9 sm:h-10 px-4 sm:px-5 text-sm font-medium rounded-lg shrink-0 cursor-pointer bg-primary hover:bg-primary-hover text-white",
          fullWidthMobile && "w-full sm:w-auto",
          className
        )}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      asChild
      className={cn(
        "h-9 sm:h-10 px-4 sm:px-5 text-sm font-medium rounded-lg shrink-0",
        fullWidthMobile && "w-full sm:w-auto",
        className
      )}
    >
      <a
        href={url && url !== "WITHOUT_RESUME" ? url : DEFAULT_APPLY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    </Button>
  );
}

