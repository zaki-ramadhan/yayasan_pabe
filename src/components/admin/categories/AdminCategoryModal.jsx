"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

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
		const val = e.target.value;
		setName(val);
		if (errors.name) {
			setErrors((prev) => ({ ...prev, name: "" }));
		}
		if (!isEdit) {
			setSlug(
				val
					.toLowerCase()
					.replace(
						/[^a-z0-9]+/g,
						"-",
					)
					.replace(
						/(^-|-$)+/g,
						"",
					),
			);
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
			submitText={
				isEdit
					? "Simpan perubahan"
					: "Tambah kategori"
			}
			submittingText="Menyimpan..."
		>
			<FormField
				label="Nama kategori"
				required
				error={errors.name}
			>
				<Input
					value={name}
					onChange={handleNameChange}
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
					onChange={(e) => {
						setSlug(e.target.value);
						if (errors.slug) {
							setErrors((prev) => ({ ...prev, slug: "" }));
						}
					}}
					placeholder="contoh: pendidikan-dakwah"
					className="text-sm font-normal font-mono"
					required
				/>
			</FormField>
		</FormDialog>
	);
}
