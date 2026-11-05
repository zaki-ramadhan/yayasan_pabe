"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { Input } from "@/components/ui/Input";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

const DEFAULT_FAQ_CATEGORIES = [
	"Umum",
	"Donasi",
	"Penyaluran",
	"Legalitas",
	"Zakat",
];

export function AdminFaqModal({
	isOpen,
	onOpenChange,
	faqToEdit = null,
	categories = [],
	onSuccess,
}) {
	const isEditing = Boolean(faqToEdit);

	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [category, setCategory] = useState("Umum");
	const [customCategories, setCustomCategories] = useState([]);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categoryList = useMemo(() => {
		return Array.from(
			new Set([
				...DEFAULT_FAQ_CATEGORIES,
				...(categories || []),
				...customCategories,
			]),
		);
	}, [categories, customCategories]);

	useEffect(() => {
		setErrors({});
		if (faqToEdit) {
			setQuestion(faqToEdit.question || "");
			setAnswer(faqToEdit.answer || "");
			setCategory(faqToEdit.category || "Umum");
		} else {
			setQuestion("");
			setAnswer("");
			setCategory("Umum");
		}
	}, [faqToEdit, isOpen]);

	const handleCreateCategory = (newCat) => {
		const trimmed = newCat.trim();
		if (trimmed) {
			setCustomCategories((prev) => [...prev, trimmed]);
			setCategory(trimmed);
			if (errors.category) {
				setErrors((prev) => ({ ...prev, category: "" }));
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!question.trim() || question.trim().length < 5) {
			newErrors.question = "Pertanyaan wajib diisi (minimal 5 karakter).";
		}
		if (!category.trim()) {
			newErrors.category = "Kategori / topik wajib diisi.";
		}
		if (!answer.trim() || answer.trim().length < 10) {
			newErrors.answer = "Jawaban wajib diisi (minimal 10 karakter).";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
			return;
		}

		setErrors({});
		const finalCategory =
			category.trim() ||
			"Umum";

		setIsSubmitting(true);
		try {
			const url =
				isEditing
					? `/api/admin/faqs/${faqToEdit.id}`
					: "/api/admin/faqs";
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
								question: question.trim(),
								answer: answer.trim(),
								category: finalCategory,
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
						? "FAQ berhasil diperbarui."
						: "FAQ baru berhasil ditambahkan.",
				);
				if (
					isCustomMode &&
					finalCategory
				) {
					setCustomCategories(
						(
							prev,
						) =>
							Array.from(
								new Set(
									[
										...prev,
										finalCategory,
									],
								),
							),
					);
				}
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
						"Gagal menyimpan FAQ.",
				);
			}
		} catch {
			toast.error(
				"Terjadi kendala jaringan saat menyimpan FAQ.",
			);
		} finally {
			setIsSubmitting(
				false,
			);
		}
	};

	const isDirty = useMemo(() => {
		if (!isEditing || !faqToEdit) {
			return Boolean(question.trim() || answer.trim());
		}
		return isFormDirty(
			{
				question: faqToEdit.question || "",
				answer: faqToEdit.answer || "",
				category: faqToEdit.category || "Umum",
			},
			{
				question,
				answer,
				category,
			}
		);
	}, [isEditing, faqToEdit, question, answer, category]);

	const isFormValid = useMemo(() => {
		const isQuestionValid = question.trim().length >= 5;
		const isCategoryValid = category.trim().length > 0;
		const isAnswerValid = answer.trim().length >= 10;
		return Boolean(isQuestionValid && isCategoryValid && isAnswerValid);
	}, [question, category, answer]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={() => onOpenChange(false)}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={
				isEditing
					? "Edit tanya jawab (FAQ)"
					: "Tambah tanya jawab (FAQ) baru"
			}
			isSubmitting={isSubmitting}
			submitText="Simpan"
			submittingText="Menyimpan..."
			submitDisabled={!isFormValid || (isEditing && !isDirty)}
		>
			<FormField
				label="Pertanyaan"
				required
				error={errors.question}
			>
				<Input
					type="text"
					placeholder="Contoh: Bagaimana cara donatur mendapatkan kuitansi resmi?"
					value={question}
					minLength={FIELD_LIMITS.FAQ_QUESTION.min}
					maxLength={FIELD_LIMITS.FAQ_QUESTION.max}
					onChange={(e) => {
						setQuestion(sanitizeStandardText(e.target.value, FIELD_LIMITS.FAQ_QUESTION.max));
						if (errors.question) {
							setErrors((prev) => ({ ...prev, question: "" }));
						}
					}}
					onBlur={() => setQuestion((prev) => prev.trim())}
					required
					className="h-10 text-sm font-normal bg-white border-slate-300"
				/>
			</FormField>

			<FormField
				label="Kategori / topik"
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
					placeholder="Pilih atau cari topik FAQ..."
					searchPlaceholder="Cari atau buat topik baru..."
					createPrefix="Gunakan topik"
					className="bg-white"
				/>
			</FormField>

			<FormField
				label="Jawaban lengkap"
				required
				error={errors.answer}
			>
				<AutoResizeTextarea
					minRows={4}
					maxRows={12}
					minLength={FIELD_LIMITS.FAQ_ANSWER.min}
					maxLength={FIELD_LIMITS.FAQ_ANSWER.max}
					placeholder="Tuliskan jawaban yang ramah, informatif, dan jelas bagi calon donatur..."
					value={answer}
					onChange={(e) => {
						setAnswer(e.target.value);
						if (errors.answer) {
							setErrors((prev) => ({ ...prev, answer: "" }));
						}
					}}
					onBlur={() => setAnswer((prev) => prev.trim())}
					required
					className="w-full text-sm font-normal leading-relaxed bg-white border-slate-300"
				/>
			</FormField>
		</FormDialog>
	);
}
