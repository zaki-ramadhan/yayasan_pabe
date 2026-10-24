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

	useEffect(() => {
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
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		onSubmit({
			...(category
				? {
						id: category.id,
					}
				: {}),
			name: name.trim(),
			slug:
				slug.trim() ||
				name
					.toLowerCase()
					.replace(
						/[^a-z0-9]+/g,
						"-",
					),
		});
	};

	return (
		<FormDialog
			isOpen={
				isOpen
			}
			onClose={
				onClose
			}
			onSubmit={
				handleSubmit
			}
			maxWidth="max-w-md"
			title={
				isEdit
					? "Edit kategori program"
					: "Tambah kategori program baru"
			}
			isSubmitting={
				isSubmitting
			}
			submitDisabled={
				!name.trim()
			}
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
			>
				<Input
					value={
						name
					}
					onChange={
						handleNameChange
					}
					placeholder="Contoh: Pendidikan & Dakwah"
					className="text-sm font-normal"
					required
				/>
			</FormField>

			<FormField
				label="Pengenal URL (Slug)"
				required
			>
				<Input
					value={
						slug
					}
					onChange={(
						e,
					) =>
						setSlug(
							e
								.target
								.value,
						)
					}
					placeholder="contoh: pendidikan-dakwah"
					className="text-sm font-normal font-mono"
					required
				/>
			</FormField>
		</FormDialog>
	);
}
