"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText, sanitizeSlug } from "@/lib/sanitizer";

export function AdminCategoryModal({
	category,
	isOpen,
	onClose,
	onSubmit,
	isSubmitting = false,
}) {
	const isEdit = Boolean(category);
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [errors, setErrors] = useState({});

	useEffect(() => {
		setErrors({});
		if (category) {
			setName(
				category.name ||
					"",
			);
			setSlug(
				category.slug ||
					"",
			);
		} else {
			setName(
				"",
			);
			setSlug(
				"",
			);
		}
	}, [category, isOpen]);

	const handleNameChange = (e) => {
		const val = sanitizeStandardText(e.target.value, 60);
		setName(val);
		if (errors.name) {
			setErrors((prev) => ({ ...prev, name: "" }));
		}
		if (!isEdit) {
			setSlug(sanitizeSlug(val, 60));
			if (errors.slug) {
				setErrors((prev) => ({ ...prev, slug: "" }));
			}
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!name.trim() || name.trim().length < 3) {
			newErrors.name = "Nama kategori wajib diisi (minimal 3 karakter).";
		}
		const cleanSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
		if (!cleanSlug || cleanSlug.length < 2) {
			newErrors.slug = "Pengenal URL (slug) wajib diisi (minimal 2 karakter).";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		onSubmit({
			...(category
				? {
						id: category.id,
					}
				: {}),
			name: name.trim(),
			slug: cleanSlug,
		});
	};

	const isDirty = useMemo(() => {
		if (!isEdit || !category) {
			return Boolean(name.trim() || slug.trim());
		}
		return isFormDirty(
			{
				name: category.name || "",
				slug: category.slug || "",
			},
			{
				name,
				slug,
			}
		);
	}, [isEdit, category, name, slug]);

	const isFormValid = useMemo(() => {
		const cleanSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
		return name.trim().length >= 3 && cleanSlug.length >= 2;
	}, [name, slug]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={handleSubmit}
			maxWidth="max-w-md"
			title={
				isEdit
					? "Edit kategori program"
					: "Tambah kategori program baru"
			}
			isSubmitting={isSubmitting}
			submitText="Simpan"
			submittingText="Menyimpan..."
			submitDisabled={!isFormValid || (isEdit && !isDirty)}
		>
			<FormField
				label="Nama kategori"
				required
				error={errors.name}
			>
				<Input
					value={name}
					maxLength={60}
					onChange={handleNameChange}
					onBlur={() => setName((prev) => prev.trim())}
					placeholder="Contoh: Pendidikan & Dakwah"
					className="text-sm font-normal"
					required
				/>
			</FormField>

			<FormField
				label="Pengenal URL (slug)"
				required
				error={errors.slug}
			>
				<Input
					value={slug}
					maxLength={60}
					spellCheck={false}
					onChange={(e) => {
						const clean = sanitizeSlug(e.target.value, 60);
						setSlug(clean);
						if (errors.slug) {
							setErrors((prev) => ({ ...prev, slug: "" }));
						}
					}}
					onBlur={() => setSlug((prev) => prev.trim())}
					placeholder="contoh: pendidikan-dakwah"
					className="text-sm font-normal font-mono"
					required
				/>
			</FormField>
		</FormDialog>
	);
}
