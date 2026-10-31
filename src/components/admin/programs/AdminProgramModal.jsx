"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { toTitleCase } from "@/lib/formatters";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { DatePicker } from "@/components/ui/DatePicker";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText } from "@/lib/sanitizer";

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
	const [story, setStory] = useState("");
	const [bannerUrl, setBannerUrl] = useState("");
	const [errors, setErrors] = useState({});
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
		setErrors({});
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
			setStory(
				campaignToEdit.story ||
					campaignToEdit.excerpt ||
					"",
			);
			setBannerUrl(
				campaignToEdit.bannerUrl ||
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
			setStory(
				"",
			);
			setBannerUrl(
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
		const newErrors = {};

		if (!title.trim() || title.trim().length < 5) {
			newErrors.title = "Judul program wajib diisi (minimal 5 karakter).";
		}
		if (!categoryId) {
			newErrors.categoryId = "Kategori program wajib dipilih.";
		}
		if (targetAmount < 0) {
			newErrors.targetAmount = "Target pendanaan tidak boleh bernilai negatif.";
		}
		if (story.trim() && story.trim().length < 10) {
			newErrors.story = "Deskripsi program minimal 10 karakter.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
			return;
		}

		setErrors({});

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
			story,
			bannerUrl: bannerUrl ? bannerUrl.trim() : null,
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

	const isDirty = useMemo(() => {
		if (!isEditing || !campaignToEdit) {
			return Boolean(title.trim() || targetAmount > 0 || story.trim() || bannerUrl.trim());
		}
		const initialEndDate = campaignToEdit.endDate
			? campaignToEdit.endDate.split("T")[0]
			: "";
		return isFormDirty(
			{
				title: campaignToEdit.title || "",
				categoryId: campaignToEdit.categoryId || categories[0]?.id || "",
				targetAmount: Number(campaignToEdit.targetAmount) || 0,
				endDate: initialEndDate,
				location: campaignToEdit.location || "",
				story: campaignToEdit.story || "",
				bannerUrl: campaignToEdit.bannerUrl || "",
			},
			{
				title,
				categoryId,
				targetAmount: Number(targetAmount) || 0,
				endDate,
				location,
				story,
				bannerUrl,
			}
		);
	}, [
		isEditing,
		campaignToEdit,
		title,
		categoryId,
		categories,
		targetAmount,
		endDate,
		location,
		story,
		bannerUrl,
	]);

	const isFormValid = useMemo(() => {
		return Boolean(
			title.trim().length >= 5 &&
			categoryId &&
			targetAmount >= 0 &&
			(!story.trim() || story.trim().length >= 10)
		);
	}, [title, categoryId, targetAmount, story]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={() => onOpenChange(false)}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={isEditing ? "Edit Program Donasi" : "Tambah Program Donasi Baru"}
			submitText="Simpan"
			submittingText="Menyimpan..."
			isSubmitting={isSubmitting}
			submitDisabled={!isFormValid || (isEditing && !isDirty)}
		>
			{/* Judul program */}
			<FormField
				label="Judul program"
				required
				error={errors.title}
			>
				<Input
					type="text"
					placeholder="Contoh: Beasiswa Pendidikan Anak Yatim Piatu"
					value={title}
					maxLength={120}
					onChange={(e) => {
						setTitle(sanitizeStandardText(e.target.value, 120));
						if (errors.title) {
							setErrors((prev) => ({ ...prev, title: "" }));
						}
					}}
					onBlur={() => setTitle((prev) => prev.trim())}
					className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
					required
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				{/* Kategori program */}
				<FormField
					label="Kategori program"
					required
					error={errors.categoryId}
				>
					<CreatableCombobox
						options={categoryList}
						value={categoryId}
						onChange={(val) => {
							setCategoryId(val);
							if (errors.categoryId) {
								setErrors((prev) => ({ ...prev, categoryId: "" }));
							}
						}}
						onCreate={handleCreateCategory}
						placeholder="Pilih kategori..."
						searchPlaceholder="Cari kategori atau buat baru..."
						createPrefix="Buat kategori"
						className="bg-white"
					/>
				</FormField>

				{/* Target donasi */}
				<FormField
					label="Target pendanaan (Rp)"
					error={errors.targetAmount}
				>
					<CurrencyInput
						placeholder="0"
						value={targetAmount}
						onChange={(val) => {
							setTargetAmount(val);
							if (errors.targetAmount) {
								setErrors((prev) => ({ ...prev, targetAmount: "" }));
							}
						}}
						className="h-10"
					/>
					<p className="text-xs text-slate-500 mt-1">
						Kosongkan atau isi 0 jika program penggalangan dana berkelanjutan tanpa batas target.
					</p>
				</FormField>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				{/* Tenggat waktu */}
				<FormField label="Batas waktu penggalangan">
					<DatePicker
						value={endDate}
						onChange={setEndDate}
						placeholder="Pilih batas waktu..."
					/>
				</FormField>

				{/* Wilayah penyaluran */}
				<FormField label="Wilayah atau lokasi penyaluran">
					<Input
						type="text"
						placeholder="Contoh: Jawa Barat & Banten"
						value={location}
						maxLength={100}
						onChange={(e) => setLocation(sanitizeStandardText(e.target.value, 100))}
						onBlur={() => setLocation((prev) => prev.trim())}
						className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
					/>
				</FormField>
			</div>

			{/* Foto sampul / banner R2 */}
			<FileUploadZone
				value={bannerUrl}
				onChange={setBannerUrl}
				context="CAMPAIGN_BANNER"
				identifier={title}
				label="Foto sampul / banner program"
				helperText="Mendukung JPG, PNG, WebP (Maks. 10MB) • Bisa Ctrl + V. Otomatis dikonversi ke WebP."
			/>

			{/* Detail & uraian cerita program */}
			<FormField
				label="Detail & cerita program"
				error={errors.story}
				hint="Ditampilkan penuh pada tab 'Detail Program' di halaman publik. Rangkuman awal otomatis dijadikan pratinjau SEO."
			>
				<Textarea
					rows={5}
					maxLength={2000}
					placeholder="Tuliskan latar belakang program, sasaran penerima manfaat, dan rincian rencana penyaluran donasi yayasan..."
					value={story}
					onChange={(e) => {
						setStory(e.target.value);
						if (errors.story) {
							setErrors((prev) => ({ ...prev, story: "" }));
						}
					}}
					onBlur={() => setStory((prev) => prev.trim())}
					className="w-full text-sm leading-relaxed"
				/>
			</FormField>
		</FormDialog>
	);
}
