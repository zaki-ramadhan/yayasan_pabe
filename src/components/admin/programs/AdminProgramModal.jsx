"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/formatters";

export function AdminProgramModal({
	isOpen,
	onOpenChange,
	campaignToEdit = null,
	categories = [],
	onSuccess,
}) {
	const isEditing = Boolean(campaignToEdit);

	const [createdCategories, setCreatedCategories] =
		useState([]);
	const [title, setTitle] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [targetAmount, setTargetAmount] = useState(0);
	const [endDate, setEndDate] = useState("");
	const [location, setLocation] = useState("");
	const [isUrgent, setIsUrgent] = useState(false);
	const [story, setStory] = useState("");
	const [isSubmitting, setIsSubmitting] =
		useState(false);

	const categoryList = useMemo(() => {
		const combined = [
			...(categories ||
				[]),
			...createdCategories,
		];
		const map = new Map();
		combined.forEach((item) => {
			if (
				item &&
				item.id
			)
				map.set(
					item.id,
					item,
				);
		});
		return Array.from(
			map.values(),
		);
	}, [categories, createdCategories]);

	useEffect(() => {
		if (campaignToEdit) {
			setTitle(
				campaignToEdit.title ||
					"",
			);
			setCategoryId(
				campaignToEdit.categoryId ||
					categories[0]
						?.id ||
					"",
			);
			setTargetAmount(
				campaignToEdit.targetAmount ||
					0,
			);
			setEndDate(
				campaignToEdit.endDate
					? campaignToEdit.endDate.split(
							"T",
						)[0]
					: "",
			);
			setLocation(
				campaignToEdit.location ||
					"",
			);
			setIsUrgent(
				Boolean(
					campaignToEdit.isUrgent,
				),
			);
			setStory(
				campaignToEdit.story ||
					campaignToEdit.excerpt ||
					"",
			);
		} else {
			setTitle(
				"",
			);
			setCategoryId(
				categories[0]
					?.id ||
					"",
			);
			setTargetAmount(
				0,
			);
			setEndDate(
				"",
			);
			setLocation(
				"Wilayah Binaan PABE",
			);
			setIsUrgent(
				false,
			);
			setStory(
				"",
			);
		}
	}, [campaignToEdit, categories, isOpen]);

	const handleCreateCategory = (name) => {
		const formatted =
			toTitleCase(
				name,
			);
		if (!formatted) return;

		// Cek apakah sudah ada di categories existing dengan perbandingan case-insensitive
		const existing =
			categoryList.find(
				(
					c,
				) =>
					(
						c.name ||
						c.label ||
						""
					).toLowerCase() ===
					formatted.toLowerCase(),
			);
		if (existing) {
			setCategoryId(
				existing.id ||
					existing.value,
			);
			toast.info(
				`Menggunakan kategori yang sudah ada: "${existing.name || existing.label}".`,
			);
			return existing;
		}

		const tempId = `new:${formatted}`;
		const tempItem = {
			id: tempId,
			name: formatted,
			isNew: true,
		};
		setCreatedCategories(
			(
				prev,
			) => {
				if (
					prev.some(
						(
							c,
						) =>
							c.name.toLowerCase() ===
							formatted.toLowerCase(),
					)
				)
					return prev;
				return [
					...prev,
					tempItem,
				];
			},
		);
		setCategoryId(tempId);
		toast.success(
			`Kategori "${formatted}" disiapkan.`,
		);
		return tempItem;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error(
				"Judul program wajib diisi.",
			);
			return;
		}
		if (!categoryId) {
			toast.error(
				"Kategori program wajib dipilih.",
			);
			return;
		}

		const isNewCat =
			categoryId.startsWith(
				"new:",
			);
		const payload = {
			title,
			targetAmount,
			endDate: endDate
				? new Date(
						endDate,
					).toISOString()
				: null,
			location,
			isUrgent,
			story,
			excerpt: story.slice(
				0,
				160,
			),
		};

		if (isNewCat) {
			payload.newCategoryName =
				categoryId.slice(
					4,
				);
		} else {
			payload.categoryId =
				categoryId;
		}

		setIsSubmitting(true);
		try {
			const url =
				isEditing
					? `/api/admin/programs/${campaignToEdit.id}`
					: "/api/admin/programs";
			const method =
				isEditing
					? "PUT"
					: "POST";

			const res =
				await safeFetch(
					url,
					{
						method,
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(
							payload,
						),
					},
				);

			const data =
				await res.json();
			if (
				data.success
			) {
				toast.success(
					isEditing
						? "Program berhasil diperbarui."
						: "Program baru berhasil dibuat.",
				);
				onOpenChange(
					false,
				);
				if (
					onSuccess
				)
					onSuccess();
			} else {
				toast.error(
					data.message ||
						"Gagal menyimpan program.",
				);
			}
		} catch {
			toast.error(
				"Terjadi kendala jaringan saat menyimpan program.",
			);
		} finally {
			setIsSubmitting(
				false,
			);
		}
	};

	return (
		<FormDialog
			isOpen={
				isOpen
			}
			onClose={() =>
				onOpenChange(
					false,
				)
			}
			onSubmit={
				handleSubmit
			}
			maxWidth="max-w-xl"
			title={
				isEditing
					? "Edit Program Donasi"
					: "Tambah Program Donasi Baru"
			}
			submitText={
				isEditing
					? "Perbarui Program"
					: "Publikasikan Program"
			}
			submittingText="Menyimpan..."
			isSubmitting={
				isSubmitting
			}
		>
			{/* Judul Program */}
			<FormField
				label="Judul Program"
				required
			>
				<Input
					type="text"
					placeholder="Contoh: Beasiswa Santri Penghafal Al-Qur'an"
					value={
						title
					}
					maxLength={
						120
					}
					onChange={(
						e,
					) =>
						setTitle(
							e
								.target
								.value,
						)
					}
					className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
					required
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				{/* Kategori Program */}
				<FormField
					label="Kategori Program"
					required
				>
					<CreatableCombobox
						options={
							categoryList
						}
						value={
							categoryId
						}
						onChange={(
							val,
						) =>
							setCategoryId(
								val,
							)
						}
						onCreate={
							handleCreateCategory
						}
						placeholder="Pilih kategori..."
						searchPlaceholder="Cari kategori atau buat baru..."
						createPrefix="Buat kategori"
						className="bg-white"
					/>
				</FormField>

				{/* Target Donasi (Dengan CurrencyInput Pemisah Ribuan 3-Digit Terpusat) */}
				<FormField
					label="Target Pendanaan (Rp)"
					required
				>
					<CurrencyInput
						placeholder="0 (atau kosongkan jika tak terbatas)"
						value={
							targetAmount
						}
						onChange={(
							val,
						) =>
							setTargetAmount(
								val,
							)
						}
						className="h-10"
					/>
				</FormField>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				{/* Tenggat Waktu (End Date) */}
				<FormField label="Batas Waktu Penggalangan">
					<Input
						type="date"
						value={
							endDate
						}
						onChange={(
							e,
						) =>
							setEndDate(
								e
									.target
									.value,
							)
						}
						className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
					/>
				</FormField>

				{/* Wilayah Penyaluran */}
				<FormField label="Wilayah / Lokasi Penyaluran">
					<Input
						type="text"
						placeholder="Contoh: Jawa Barat & Banten"
						value={
							location
						}
						onChange={(
							e,
						) =>
							setLocation(
								e
									.target
									.value,
							)
						}
						className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
					/>
				</FormField>
			</div>

			{/* Urgent Program Checkbox */}
			<Checkbox
				id="isUrgent"
				variant="card"
				checked={
					isUrgent
				}
				onCheckedChange={
					setIsUrgent
				}
				label="Tandai sebagai Program Mendesak"
				description="Program akan mendapat prioritas banner dan badge darurat di beranda utama"
			/>

			{/* Deskripsi & Cerita Program */}
			<FormField label="Cerita & Latar Belakang Program">
				<Textarea
					rows={
						4
					}
					placeholder="Ceritakan latar belakang mustahik, tujuan penyaluran dana, dan kebutuhan mendesak..."
					value={
						story
					}
					onChange={(
						e,
					) =>
						setStory(
							e
								.target
								.value,
						)
					}
					className="w-full text-sm leading-relaxed"
				/>
			</FormField>
		</FormDialog>
	);
}
