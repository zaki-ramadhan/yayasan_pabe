"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
	({ className, children, hideCloseButton = true, ...props }, ref) => (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					"fixed left-[50%] top-[50%] z-50 flex flex-col w-[calc(100%-2rem)] min-w-[300px] sm:min-w-[400px] max-w-lg max-h-[85vh] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
					className,
				)}
				{...props}
			>
				{children}
				{!hideCloseButton && (
					<DialogPrimitive.Close className="absolute right-3.5 top-3.5 z-20 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
						<X className="h-4 w-4" />
						<span className="sr-only">Tutup</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, children, hideCloseButton = false, ...props }) => (
	<div
		className={cn(
			"flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 shrink-0 bg-white gap-3",
			className,
		)}
		{...props}
	>
		<div className="flex-1 min-w-0 pr-2">
			{children}
		</div>
		{!hideCloseButton && (
			<DialogPrimitive.Close className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shrink-0 -mr-1">
				<X className="h-4 w-4" />
				<span className="sr-only">Tutup</span>
			</DialogPrimitive.Close>
		)}
	</div>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0",
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"text-base sm:text-lg font-semibold leading-snug tracking-tight text-slate-900",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn(
			"text-xs sm:text-sm text-slate-600 leading-relaxed",
			className,
		)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * Header modal terstandarisasi dengan teks judul bersih tanpa icon samping dan tanpa subteks
 */
function DialogHeaderWithIcon({
	title,
	className = "",
	hideCloseButton = false,
}) {
	return (
		<DialogHeader className={className} hideCloseButton={hideCloseButton}>
			<DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
				{title}
			</DialogTitle>
		</DialogHeader>
	);
}

/**
 * Footer aksi modal terstandarisasi dengan tombol Batal dan Simpan
 */
function DialogFooterActions({
	onCancel,
	cancelText = "Batal",
	cancelLabel,
	submitText = "Simpan",
	submitLabel,
	submittingText = "Menyimpan...",
	submittingLabel,
	isSubmitting = false,
	submitDisabled = false,
	submitVariant = "default",
	className = "",
}) {
	const activeSubmitText = submitLabel || submitText;
	const activeSubmittingText = submittingLabel || submittingText;
	const activeCancelText = cancelLabel || cancelText;

	return (
		<DialogFooter className={className}>
			<button
				type="button"
				onClick={onCancel}
				disabled={isSubmitting}
				className="inline-flex items-center justify-center h-9 px-4 min-w-[84px] rounded-lg text-sm font-normal border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
			>
				{activeCancelText}
			</button>
			<button
				type="submit"
				disabled={isSubmitting || submitDisabled}
				className={cn(
					"inline-flex items-center justify-center h-9 px-4 min-w-[96px] rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap",
					submitVariant === "destructive"
						? "bg-rose-600 text-white hover:bg-rose-700"
						: "bg-primary text-white hover:bg-primary/90"
				)}
			>
				{isSubmitting ? activeSubmittingText : activeSubmitText}
			</button>
		</DialogFooter>
	);
}

/**
 * Komponen Template Universal untuk Modal Create & Edit (Formulir CRUD)
 */
function FormDialog({
	isOpen,
	onClose,
	onSubmit,
	title,
	maxWidth = "max-w-lg",
	children,
	submitText = "Simpan",
	submitLabel,
	submittingText = "Menyimpan...",
	submittingLabel,
	cancelText = "Batal",
	cancelLabel,
	isSubmitting = false,
	submitDisabled = false,
	submitVariant = "default",
	className = "",
	formClassName = "space-y-4",
}) {
	const activeSubmitText = submitLabel || submitText;
	const activeSubmittingText = submittingLabel || submittingText;
	const activeCancelText = cancelLabel || cancelText;
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className={cn(
					"min-h-[200px] sm:min-h-[220px] max-h-[85vh] overflow-hidden p-0 gap-0 bg-white border border-slate-200 flex flex-col",
					maxWidth,
					className
				)}
			>
				{title && (
					<DialogHeader>
						<DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
							{title}
						</DialogTitle>
					</DialogHeader>
				)}

				<form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
					<div className={cn("flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6", formClassName)}>
						{children}
					</div>

					<DialogFooterActions
						onCancel={onClose}
						cancelText={activeCancelText}
						submitText={activeSubmitText}
						submittingText={activeSubmittingText}
						isSubmitting={isSubmitting}
						submitDisabled={submitDisabled}
						submitVariant={submitVariant}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogHeaderWithIcon,
	DialogFooterActions,
	FormDialog,
};

