import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

const Table = React.forwardRef(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn("relative w-full overflow-x-auto", containerClassName)}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-left text-sm border-collapse text-slate-800",
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-slate-50/90 border-b border-slate-200", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100 bg-white", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-slate-200 bg-slate-50/60 font-medium text-slate-800",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-100 transition-colors hover:bg-slate-50/70 data-[state=selected]:bg-slate-100 [&>td]:align-middle [&>th]:align-middle",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "py-3 px-3.5 sm:px-4 text-left align-middle text-sm font-medium text-slate-900",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "py-3.5 px-3.5 sm:px-4 align-middle text-sm font-normal text-slate-800",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-slate-600", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/**
 * Komponen template icon sorting tabel yang reusable dan customizable.
 */
export function TableSortIcon({
  isSorted = false,
  sortOrder = "desc",
  className = "",
  activeClassName = "text-primary",
  inactiveClassName = "text-slate-400 group-hover:text-slate-600",
}) {
  if (!isSorted) {
    return (
      <ChevronsUpDown
        className={cn("w-4 h-4 shrink-0 transition-colors", inactiveClassName, className)}
      />
    );
  }

  if (sortOrder === "asc") {
    return (
      <ChevronUp
        className={cn("w-4 h-4 shrink-0 transition-colors", activeClassName, className)}
      />
    );
  }

  return (
    <ChevronDown
      className={cn("w-4 h-4 shrink-0 transition-colors", activeClassName, className)}
    />
  );
}

/**
 * Komponen mandiri untuk kolom header dengan fitur sorting interaktif
 */
export function TableSortHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder = "desc",
  onSort,
  align = "left",
  className = "",
  iconClassName = "",
  renderIcon,
}) {
  const isSorted = currentSortBy === sortKey;

  const handleClick = () => {
    if (!onSort || !sortKey) return;
    if (isSorted) {
      onSort(sortKey, currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(sortKey, "desc");
    }
  };

  const alignClass =
    align === "center"
      ? "justify-center text-center"
      : align === "right"
      ? "justify-end text-right"
      : "justify-start text-left";

  return (
    <TableHead
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {sortKey && onSort ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "group inline-flex items-center gap-1.5 font-medium text-sm text-slate-900 hover:text-primary transition-colors cursor-pointer select-none",
            alignClass
          )}
        >
          <span>{label}</span>
          {typeof renderIcon === "function" ? (
            renderIcon({ isSorted, sortOrder: currentSortOrder })
          ) : (
            <TableSortIcon
              isSorted={isSorted}
              sortOrder={currentSortOrder}
              className={iconClassName}
            />
          )}
        </button>
      ) : (
        <span
          className={cn(
            "block font-medium text-sm text-slate-900",
            align === "center" && "text-center",
            align === "right" && "text-right"
          )}
        >
          {label}
        </span>
      )}
    </TableHead>
  );
}

/**
 * Komponen mandiri baris empty state tabel
 */
export function TableEmptyRow({
  colSpan = 5,
  message = "Belum ada data",
  className = "",
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className={cn(
          "py-12 text-center text-sm font-normal text-slate-600 align-middle",
          className
        )}
      >
        <p className="max-w-md mx-auto">{message}</p>
      </TableCell>
    </TableRow>
  );
}

export function TableSkeletonRows({
  rows = 5,
  colSpan,
  columns = colSpan || 5,
  height = "h-4",
  cellWidths = ["w-8", "w-36", "w-24", "w-48", "w-28", "w-24", "w-16"],
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={rIdx} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={cIdx} className="py-3.5 px-3.5 sm:px-4 align-middle">
              <div
                className={cn(
                  "bg-slate-200/80 rounded animate-pulse",
                  height,
                  cellWidths[cIdx % cellWidths.length] || "w-full"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Komponen mandiri footer pagination tabel terstandarisasi
 */
export function TablePaginationFooter({
  pagination,
  currentPage = pagination?.currentPage || 1,
  totalPages = pagination?.totalPages || 1,
  total = pagination?.total || 0,
  limit = pagination?.limit || 10,
  onPageChange,
  className = "",
}) {
  const fromRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const toRecord = Math.min(currentPage * limit, total);

  return (
    <div
      className={cn(
        "px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-200/90 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600",
        className
      )}
    >
      <div className="leading-normal flex items-center">
        Menampilkan{" "}
        <span className="font-medium text-slate-900 mx-1">{fromRecord}</span> -{" "}
        <span className="font-medium text-slate-900 mx-1">{toRecord}</span> dari{" "}
        <span className="font-medium text-slate-900 ml-1 mr-1">{total}</span> data
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

export { useTableSort } from "@/hooks/useTableSort";

