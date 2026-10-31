/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { DatePicker } from "@/components/ui/DatePicker";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { uploadFileToServer } from "@/services/uploadService";
import { isYouTubeUrl } from "@/lib/galleryGroupHelper";
import { AdminDistributionMediaFields } from "./AdminDistributionMediaFields";

export function AdminDistributionModal({
	isOpen,
	onOpenChange,
	campaigns = [],
	distributionToEdit = null,
	onSuccess,
}) {
	const isEditing = Boolean(distributionToEdit);

	const [campaignId, setCampaignId] = useState(
		campaigns[0]?.id || "",
	);
	const [title, setTitle] = useState("");
	const [disbursedAmount, setDisbursedAmount] =
		useState(0);
	const [date, setDate] = useState(
		new Date()
			.toISOString()
			.split(
				"T",
			)[0],
	);
	const [content, setContent] = useState("");
	const [existingMedia, setExistingMedia] = useState([]);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [uploadProgressText, setUploadProgressText] = useState("");
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setErrors({});
		setUploadProgressText("");
		setSelectedFiles([]);
		if (distributionToEdit) {
			setCampaignId(
				distributionToEdit.campaignId ||
					campaigns[0]?.id ||
					"",
			);
			setTitle(
				distributionToEdit.title ||
					"",
			);
			setDisbursedAmount(
				Number(
					distributionToEdit.disbursedAmount ||
						0,
				),
			);
			setDate(
				distributionToEdit.date
					? distributionToEdit.date.slice(
							0,
							10,
						)
					: new Date()
							.toISOString()
							.split(
								"T",
							)[0],
			);
			setContent(
				distributionToEdit.content ||
					"",
			);

			const rawImages = Array.isArray(distributionToEdit.images)
				? distributionToEdit.images
				: [];
			const foundYt = rawImages.find((url) => isYouTubeUrl(url)) || "";
			const nonYt = rawImages.filter((url) => !isYouTubeUrl(url));
			setExistingMedia(nonYt);
			setYoutubeUrl(foundYt);
		} else {
			setCampaignId(
				campaigns[0]?.id ||
					"",
			);
			setTitle("");
			setDisbursedAmount(0);
			setDate(
				new Date()
					.toISOString()
					.split(
						"T",
					)[0],
			);
			setContent("");
			setExistingMedia([]);
			setYoutubeUrl("");
		}
	}, [distributionToEdit, isOpen, campaigns]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!campaignId) {
			newErrors.campaignId = "Pilih program donasi asal penyaluran.";
		}
		if (!title.trim() || title.trim().length < 5) {
			newErrors.title = "Judul kegiatan penyaluran wajib diisi (minimal 5 karakter).";
		}
		if (!disbursedAmount || disbursedAmount <= 0) {
			newErrors.disbursedAmount = "Nominal dana penyaluran wajib lebih dari Rp 0.";
		}
		if (!date) {
			newErrors.date = "Tanggal penyaluran wajib dipilih.";
		}
		if (!content.trim() || content.trim().length < 10) {
			newErrors.content = "Rincian penyaluran wajib diisi (minimal 10 karakter).";
		}

		const cleanYt = youtubeUrl.trim();
		if (cleanYt && !isYouTubeUrl(cleanYt)) {
			newErrors.youtube = "Format tautan video YouTube tidak valid.";
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
			// Unggah berkas baru foto & video langsung ke R2
			const uploadedUrls = [];
			const total = selectedFiles.length;

			for (let i = 0; i < total; i++) {
				const item = selectedFiles[i];
				const isVid = Boolean(item.isVideo);
				const mediaLabel = isVid ? "video" : "foto";
				setUploadProgressText(
					`Mengunggah ${mediaLabel} ${i + 1} dari ${total} (0%)...`
				);

				const uploadResult = await uploadFileToServer({
					file: item.file,
					context: isVid ? "CAMPAIGN_UPDATE_VIDEO" : "CAMPAIGN_UPDATE",
					identifier: title.trim(),
					onProgress: (percent) => {
						setUploadProgressText(
							percent < 100
								? `Mengunggah ${mediaLabel} ${i + 1} dari ${total} (${percent}%)...`
								: `Memproses ${mediaLabel} ${i + 1} dari ${total}...`
						);
					},
				});
				uploadedUrls.push(uploadResult.url);
			}

			// Gabungkan media tersimpan, media baru terunggah, dan tautan YouTube
			const finalImages = [
				...existingMedia,
				...uploadedUrls,
				...(cleanYt && isYouTubeUrl(cleanYt) ? [cleanYt] : []),
			];

			setUploadProgressText("Menyimpan ke basis data...");

			const url =
				isEditing
					? `/api/admin/distributions/${distributionToEdit.id}`
					: "/api/admin/distributions";
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
								campaignId,
								title: title.trim(),
								disbursedAmount,
								date,
								content: content.trim(),
								images: finalImages,
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
						? "Rekam penyaluran berhasil diperbarui."
						: "Dokumentasi penyaluran mustahik berhasil dicatat.",
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
						"Gagal menyimpan penyaluran.",
				);
			}
		} catch (err) {
			toast.error(
				err?.message || "Terjadi kendala jaringan saat menyimpan penyaluran.",
			);
		} finally {
			setUploadProgressText("");
			setIsSubmitting(
				false,
			);
		}
	};

	const isDirty = useMemo(() => {
		if (!isEditing || !distributionToEdit) {
			return Boolean(
				title.trim() ||
				disbursedAmount > 0 ||
				content.trim() ||
				selectedFiles.length > 0 ||
				youtubeUrl.trim()
			);
		}
		const initialDate = distributionToEdit.date ? distributionToEdit.date.split("T")[0] : "";
		const initialImages = Array.isArray(distributionToEdit.images)
			? distributionToEdit.images
			: [];
		const initialYt = initialImages.find((url) => isYouTubeUrl(url)) || "";
		const initialNonYt = initialImages.filter((url) => !isYouTubeUrl(url));

		const mediaChanged =
			selectedFiles.length > 0 ||
			youtubeUrl.trim() !== initialYt ||
			existingMedia.length !== initialNonYt.length ||
			existingMedia.some((m, idx) => m !== initialNonYt[idx]);

		if (mediaChanged) return true;

		return isFormDirty(
			{
				campaignId: distributionToEdit.campaignId || campaigns[0]?.id || "",
				title: distributionToEdit.title || "",
				disbursedAmount: Number(distributionToEdit.disbursedAmount) || 0,
				date: initialDate,
				content: distributionToEdit.content || "",
			},
			{
				campaignId,
				title,
				disbursedAmount: Number(disbursedAmount) || 0,
				date,
				content,
			}
		);
	}, [
		isEditing,
		distributionToEdit,
		campaignId,
		campaigns,
		title,
		disbursedAmount,
		date,
		content,
		selectedFiles,
		existingMedia,
		youtubeUrl,
	]);

	const isFormValid = useMemo(() => {
		return Boolean(
			campaignId &&
			title.trim().length >= 5 &&
			disbursedAmount > 0 &&
			date &&
			content.trim().length >= 10
		);
	}, [campaignId, title, disbursedAmount, date, content]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={() => onOpenChange(false)}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={
				isEditing
					? "Edit rekam penyaluran donasi"
					: "Catat penyaluran donasi ke mustahik"
			}
			isSubmitting={isSubmitting}
			submitText="Simpan"
			submittingText={uploadProgressText || "Menyimpan..."}
			submitDisabled={!isFormValid || (isEditing && !isDirty)}
		>
			<FormField
				label="Program donasi terkait"
				required
				error={errors.campaignId}
			>
				<CreatableCombobox
					options={campaigns.map((c) => ({
						value: c.id,
						label: c.title,
					}))}
					value={campaignId}
					onChange={(val) => {
						setCampaignId(val);
						if (errors.campaignId) {
							setErrors((prev) => ({ ...prev, campaignId: "" }));
						}
					}}
					placeholder="Pilih program asal dana penyaluran..."
					searchPlaceholder="Cari nama program..."
					allowCreate={false}
					className="bg-white"
				/>
			</FormField>

			<FormField
				label="Judul kegiatan penyaluran"
				required
				error={errors.title}
			>
				<Input
					type="text"
					placeholder="Contoh: Penyerahan Santunan Sembako & Biaya Pendidikan Mustahik"
					value={title}
					maxLength={150}
					onChange={(e) => {
						setTitle(sanitizeStandardText(e.target.value, 150));
						if (errors.title) {
							setErrors((prev) => ({ ...prev, title: "" }));
						}
					}}
					onBlur={() => setTitle(title.trim())}
					className="h-10 text-sm font-normal"
					required
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				<FormField
					label="Nominal dana tersalurkan"
					required
					error={errors.disbursedAmount}
				>
					<CurrencyInput
						value={disbursedAmount}
						onChange={(val) => {
							setDisbursedAmount(val);
							if (errors.disbursedAmount) {
								setErrors((prev) => ({ ...prev, disbursedAmount: "" }));
							}
						}}
						placeholder="0"
						className="h-10 text-sm font-normal"
						required
					/>
				</FormField>

				<FormField
					label="Tanggal penyaluran"
					required
					error={errors.date}
				>
					<DatePicker
						value={date}
						onChange={(val) => {
							setDate(val);
							if (errors.date) {
								setErrors((prev) => ({ ...prev, date: "" }));
							}
						}}
						placeholder="Pilih tanggal penyaluran..."
					/>
				</FormField>
			</div>

			<FormField
				label="Deskripsi berita & rincian penyaluran"
				required
				error={errors.content}
			>
				<Textarea
					rows={4}
					maxLength={3000}
					placeholder="Rincian jumlah penerima manfaat, lokasi penyerahan, dan ucapan doa dari mustahik..."
					value={content}
					onChange={(e) => {
						setContent(e.target.value);
						if (errors.content) {
							setErrors((prev) => ({ ...prev, content: "" }));
						}
					}}
					onBlur={() => setContent((prev) => prev.trim())}
					className="w-full text-sm font-normal leading-relaxed border-slate-300"
					required
				/>
			</FormField>

			{/* Sub-komponen modular upload foto, video R2, dan video YouTube */}
			<AdminDistributionMediaFields
				existingMedia={existingMedia}
				onRemoveExistingMedia={(idx) =>
					setExistingMedia((prev) => prev.filter((_, i) => i !== idx))
				}
				selectedFiles={selectedFiles}
				onFilesChange={setSelectedFiles}
				youtubeUrl={youtubeUrl}
				onYoutubeUrlChange={setYoutubeUrl}
				isUploading={isSubmitting}
				uploadProgressText={uploadProgressText}
				error={errors.youtube}
			/>
		</FormDialog>
	);
}
