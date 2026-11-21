"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { toTitleCase } from "@/lib/formatters";
import { isFormDirty } from "@/lib/formUtils";
import { useStagedUploads } from "@/hooks/useStagedUploads";
import { isZisCategory, ZIS_LOCKED_CATEGORIES } from "@/lib/zisFilter";
import { AdminProgramFormFields } from "./AdminProgramFormFields";

export function AdminProgramModal({
	isOpen,
	onOpenChange,
	campaignToEdit = null,
	categories = [],
	mode = "all",
	onSuccess,
}) {
	const isEditing = Boolean(campaignToEdit);
	const isZisMode = mode === "zis";

	const [createdCategories, setCreatedCategories] =
		useState([]);
	const [title, setTitle] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [targetAmount, setTargetAmount] = useState(0);
	const [endDate, setEndDate] = useState("");
	const [location, setLocation] = useState("");
	const [story, setStory] = useState("");
	const [bannerUrl, setBannerUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	const { trackUpload, commitUploads, discardUploads } = useStagedUploads();

	const handleClose = () => {
		discardUploads();
		onOpenChange(false);
	};

	const zisCategoryOptions = useMemo(() => {
		return ZIS_LOCKED_CATEGORIES.map((locked) => {
			const matched = (categories || []).find(
				(c) =>
					String(c.slug || "").toLowerCase() === locked.slug ||
					String(c.id || "").toLowerCase() === locked.id
			);
			return {
				id: matched?.id || locked.id,
				name: locked.name,
				slug: locked.slug,
			};
		});
	}, [categories]);

	const categoryList = useMemo(() => {
		if (isZisMode) {
			return zisCategoryOptions;
		}
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
		const all = Array.from(map.values());
		if (mode === "donation") {
			const donationCats = all.filter((c) => !isZisCategory(c));
			return donationCats.length > 0 ? donationCats : all;
		}
		return all;
	}, [categories, createdCategories, isZisMode, mode, zisCategoryOptions]);

	const defaultCategoryId = useMemo(() => {
		if (isZisMode) {
			return zisCategoryOptions[0]?.id || "zakat";
		}
		if (mode === "donation") {
			const donCat = (categories || []).find((c) => !isZisCategory(c));
			if (donCat?.id) return donCat.id;
		}
		return categories[0]?.id || "";
	}, [categories, isZisMode, mode, zisCategoryOptions]);

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
				defaultCategoryId,
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
	}, [campaignToEdit, categories, defaultCategoryId, isOpen]);

	const handleCreateCategory = (name) => {
		const formatted =
			toTitleCase(
				name,
			);
		if (!formatted) return;

		if (
			isZisMode ||
			isZisCategory({ name: formatted }) ||
			formatted.toLowerCase().includes("ziswaf")
		) {
			toast.error("Kategori Zakat, Infaq, dan Sedekah dikelola secara khusus di halaman Kelola Program ZIS.");
			return null;
		}

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

		setIsSubmitting(true);
		try {
			const isNewCat = categoryId.startsWith("new:");
			const payload = {
				mode,
				title,
				targetAmount,
				endDate: endDate ? new Date(endDate).toISOString() : null,
				location,
				story,
				bannerUrl: bannerUrl ? String(bannerUrl).trim() : null,
				excerpt: story.slice(0, 160),
			};

			if (isNewCat) {
				payload.newCategoryName = categoryId.slice(4);
			} else {
				payload.categoryId = categoryId;
			}
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
				commitUploads();
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
			setIsSubmitting(false);
		}
	};

	const isDirty = useMemo(() => {
		const hasBanner = bannerUrl instanceof File || (typeof bannerUrl === "string" && Boolean(bannerUrl.trim()));
		if (!isEditing || !campaignToEdit) {
			return Boolean(title.trim() || targetAmount > 0 || story.trim() || hasBanner);
		}
		const initialEndDate = campaignToEdit.endDate
			? campaignToEdit.endDate.split("T")[0]
			: "";
		if (bannerUrl instanceof File) return true;
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
				bannerUrl: typeof bannerUrl === "string" ? bannerUrl : "",
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
			onClose={handleClose}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={
				isZisMode
					? isEditing
						? "Edit Program ZIS"
						: "Tambah Program ZIS Baru"
					: isEditing
					? "Edit Program Donasi"
					: "Tambah Program Donasi Baru"
			}
			submitText="Simpan"
			submittingText="Menyimpan..."
			isSubmitting={isSubmitting}
			submitDisabled={!isFormValid || (isEditing && !isDirty)}
		>
			<AdminProgramFormFields
				isZisMode={isZisMode}
				title={title}
				setTitle={setTitle}
				categoryId={categoryId}
				setCategoryId={setCategoryId}
				categoryList={categoryList}
				onCreateCategory={handleCreateCategory}
				targetAmount={targetAmount}
				setTargetAmount={setTargetAmount}
				endDate={endDate}
				setEndDate={setEndDate}
				location={location}
				setLocation={setLocation}
				bannerUrl={bannerUrl}
				setBannerUrl={setBannerUrl}
				story={story}
				setStory={setStory}
				errors={errors}
				clearError={(field) => setErrors((prev) => ({ ...prev, [field]: "" }))}
				onUploadSuccess={trackUpload}
			/>
		</FormDialog>
	);
}
