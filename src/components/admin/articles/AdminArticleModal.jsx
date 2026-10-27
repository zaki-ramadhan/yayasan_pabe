"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/formatters";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";

const DEFAULT_ARTICLE_CATEGORIES = [
	"Berita",
	"Penyaluran",
	"Sosial",
	"Edukasi",
	"Ziswaf",
	"Inspirasi",
];

export function AdminArticleModal({
	isOpen,
	onOpenChange,
	articleToEdit = null,
	categories = [],
	onSuccess,
}) {
	const isEditing = Boolean(articleToEdit);

	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("Berita");
	const [customCategories, setCustomCategories] =
		useState([]);
	const [author, setAuthor] = useState(
		"Redaksi Yayasan PABE",
	);
	const [bannerUrl, setBannerUrl] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] =
		useState(false);

	const categoryList = useMemo(() => {
		const fromProps = (
			categories ||
			[]
		).filter(
			(
				c,
			) =>
				c !==
					"Semua Kategori" &&
				c !==
					"ALL",
		);
		return Array.from(
			new Set(
				[
					...DEFAULT_ARTICLE_CATEGORIES,
					...fromProps,
					...customCategories,
				],
			),
		);
	}, [categories, customCategories]);

	const handleCreateCategory = (newCat) => {
		const formatted =
			toTitleCase(
				newCat,
			);
		if (formatted) {
			const existing =
				categoryList.find(
					(
						c,
					) =>
						c.toLowerCase() ===
						formatted.toLowerCase(),
				);
			if (
				existing
			) {
				setCategory(
					existing,
				);
				if (errors.category) {
					setErrors((prev) => ({ ...prev, category: "" }));
				}
				toast.info(
					`Menggunakan kategori yang sudah ada: "${existing}".`,
				);
				return existing;
			}
			setCustomCategories(
				(
					prev,
				) =>
					Array.from(
						new Set(
							[
								...prev,
								formatted,
							],
						),
					),
			);
			setCategory(
				formatted,
			);
			if (errors.category) {
				setErrors((prev) => ({ ...prev, category: "" }));
			}
			toast.success(
				`Kategori "${formatted}" siap digunakan.`,
			);
			return formatted;
		}
	};

	useEffect(() => {
		setErrors({});
		if (articleToEdit) {
			setTitle(
				articleToEdit.title ||
					"",
			);
			setCategory(
				articleToEdit.category ||
					"Berita",
			);
			setAuthor(
				articleToEdit.author ||
					"Redaksi Yayasan PABE",
			);
			setBannerUrl(
				articleToEdit.bannerUrl || "",
			);
			setExcerpt(
				articleToEdit.excerpt ||
					"",
			);
			setContent(
				articleToEdit.content ||
					"",
			);
		} else {
			setTitle(
				"",
			);
			setCategory(
				"Berita",
			);
			setAuthor(
				"Redaksi Yayasan PABE",
			);
			setBannerUrl("");
			setExcerpt(
				"",
			);
			setContent(
				"",
			);
		}
	}, [articleToEdit, isOpen]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!title.trim() || title.trim().length < 5) {
			newErrors.title = "Judul artikel wajib diisi (minimal 5 karakter).";
		}
		if (!category) {
			newErrors.category = "Kategori berita wajib dipilih.";
		}
		if (!content.trim() || content.trim().length < 20) {
			newErrors.content = "Isi konten artikel wajib diisi (minimal 20 karakter).";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
			return;
		}

		setErrors({});

		setIsSubmitting(true);
		try {
			const url =
				isEditing
					? `/api/admin/articles/${articleToEdit.id}`
					: "/api/admin/articles";
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
							{
								title,
								category,
								author,
								bannerUrl,
								excerpt:
									excerpt.trim() ||
									content.slice(
										0,
										150,
									),
								content,
							},
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
						? "Artikel berhasil diperbarui."
						: "Artikel baru berhasil diterbitkan.",
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
						"Gagal menyimpan artikel.",
				);
			}
		} catch {
			toast.error(
				"Terjadi kendala jaringan saat menyimpan artikel.",
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
			maxWidth="max-w-2xl"
			title={
				isEditing
					? "Edit artikel berita"
					: "Tulis artikel & berita baru"
			}
			submitText={
				isEditing
					? "Simpan perubahan"
					: "Terbitkan artikel"
			}
			submittingText="Menyimpan..."
			isSubmitting={
				isSubmitting
			}
		>
			{/* Judul artikel */}
			<FormField
				label="Judul artikel"
				required
				error={errors.title}
			>
				<Input
					type="text"
					placeholder="Contoh: Distribusi 500 Paket Sembako untuk Lansia Dhuafa"
					value={title}
					onChange={(e) => {
						setTitle(e.target.value);
						if (errors.title) {
							setErrors((prev) => ({ ...prev, title: "" }));
						}
					}}
					required
					className="h-10 text-sm bg-white"
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				{/* Kategori */}
				<FormField
					label="Kategori berita"
					required
					error={errors.category}
				>
					<CreatableCombobox
						options={categoryList}
						value={category}
						onChange={(val) => {
							setCategory(val);
							if (errors.category) {
								setErrors((prev) => ({ ...prev, category: "" }));
							}
						}}
						onCreate={handleCreateCategory}
						placeholder="Pilih kategori berita..."
						searchPlaceholder="Cari kategori atau buat baru..."
						createPrefix="Buat kategori"
						className="bg-white"
					/>
				</FormField>

				{/* Penulis / Redaksi */}
				<FormField label="Nama penulis / redaksi">
					<Input
						type="text"
						placeholder="Contoh: Tim Humas PABE"
						value={author}
						onChange={(e) => setAuthor(e.target.value)}
						className="h-10 text-sm bg-white"
					/>
				</FormField>
			</div>

			{/* Banner Upload / URL */}
			<FileUploadZone
				value={bannerUrl}
				onChange={setBannerUrl}
				context="ARTICLE_BANNER"
				identifier={title}
				label="Foto sampul / banner artikel"
				helperText="Mendukung JPG, PNG, WebP (Maks. 5MB). Disimpan rapi ke articles/banners."
			/>

			{/* Ringkasan Singkat (Excerpt) */}
			<FormField label="Ringkasan singkat (lead / excerpt)">
				<Textarea
					rows={2}
					placeholder="Ringkasan 1-2 kalimat pengantar artikel untuk kartu dan preview..."
					value={excerpt}
					onChange={(e) => setExcerpt(e.target.value)}
					className="w-full text-sm leading-relaxed bg-white"
				/>
			</FormField>

			{/* Isi Konten Lengkap */}
			<FormField
				label="Isi konten berita lengkap"
				required
				error={errors.content}
			>
				<Textarea
					rows={6}
					placeholder="Tuliskan berita lengkap mengenai kegiatan, narasumber, kronologi, serta ucapan terima kasih kepada donatur..."
					value={content}
					onChange={(e) => {
						setContent(e.target.value);
						if (errors.content) {
							setErrors((prev) => ({ ...prev, content: "" }));
						}
					}}
					required
					className="w-full text-sm leading-relaxed bg-white"
				/>
			</FormField>
		</FormDialog>
	);
}
