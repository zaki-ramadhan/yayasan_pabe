/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { isFormDirty } from "@/lib/formUtils";
import { uploadFileToServer } from "@/services/uploadService";
import { isYouTubeUrl } from "@/lib/galleryGroupHelper";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import {
	calculateCampaignDisbursementBudget,
	validateDisbursementAmount,
} from "@/lib/distributionConstants";
import { AdminDistributionMediaFields } from "./AdminDistributionMediaFields";
import { AdminDistributionDetailFields } from "./AdminDistributionDetailFields";

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

	const selectedCampaign = useMemo(() => {
		return campaigns.find((c) => c.id === campaignId) || null;
	}, [campaigns, campaignId]);

	const currentCampaignBudget = useMemo(() => {
		if (!selectedCampaign) return null;
		return calculateCampaignDisbursementBudget({
			collectedAmount: selectedCampaign.collectedAmount || 0,
			totalDisbursed: selectedCampaign.totalDisbursed || 0,
			currentDisbursementAmount: isEditing
				? Number(distributionToEdit?.disbursedAmount) || 0
				: 0,
		});
	}, [selectedCampaign, isEditing, distributionToEdit]);

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
		} else if (currentCampaignBudget) {
			const budgetValidation = validateDisbursementAmount(
				disbursedAmount,
				currentCampaignBudget.remainingBudget
			);
			if (!budgetValidation.isValid) {
				newErrors.disbursedAmount = budgetValidation.error;
			}
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
					posterDataUrl: isVid ? item.thumbnailUrl : undefined,
					onProgress: (percent) => {
						setUploadProgressText(
							percent < 100
								? `Mengunggah ${mediaLabel} ${i + 1} dari ${total} (${percent}%)...`
								: `Menyiapkan ${mediaLabel} ${i + 1} dari ${total}...`
						);
					},
				});
				uploadedUrls.push(uploadResult.url);
			}

			const finalImages = [
				...existingMedia,
				...uploadedUrls,
				...(cleanYt && isYouTubeUrl(cleanYt) ? [cleanYt] : []),
			];

			setUploadProgressText("Menyimpan dokumentasi penyaluran...");

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
		const isBasicValid = Boolean(
			campaignId &&
			title.trim().length >= 5 &&
			disbursedAmount > 0 &&
			date &&
			content.trim().length >= 10
		);
		if (!isBasicValid) return false;
		if (currentCampaignBudget) {
			const budgetCheck = validateDisbursementAmount(
				disbursedAmount,
				currentCampaignBudget.remainingBudget
			);
			if (!budgetCheck.isValid) return false;
		}
		return true;
	}, [campaignId, title, disbursedAmount, date, content, currentCampaignBudget]);

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
			<AdminDistributionDetailFields
				campaignOptions={campaigns.map((c) => ({
					value: c.id,
					label: c.title,
				}))}
				campaignId={campaignId}
				setCampaignId={(val) => {
					setCampaignId(val);
					if (errors.campaignId) {
						setErrors((prev) => ({ ...prev, campaignId: "" }));
					}
					if (disbursedAmount > 0) {
						const newSelected = campaigns.find((c) => c.id === val) || null;
						if (newSelected) {
							const newBudget = calculateCampaignDisbursementBudget({
								collectedAmount: newSelected.collectedAmount || 0,
								totalDisbursed: newSelected.totalDisbursed || 0,
								currentDisbursementAmount: isEditing
									? Number(distributionToEdit?.disbursedAmount) || 0
									: 0,
							});
							const check = validateDisbursementAmount(disbursedAmount, newBudget.remainingBudget);
							setErrors((prev) => ({
								...prev,
								disbursedAmount: check.isValid ? "" : check.error,
							}));
						}
					}
				}}
				selectedCampaign={selectedCampaign}
				disbursedAmount={disbursedAmount}
				setDisbursedAmount={setDisbursedAmount}
				isEditing={isEditing}
				initialDisbursedAmount={distributionToEdit?.disbursedAmount}
				currentCampaignBudget={currentCampaignBudget}
				title={title}
				setTitle={setTitle}
				date={date}
				setDate={setDate}
				content={content}
				setContent={setContent}
				errors={errors}
				setErrors={setErrors}
			/>

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
