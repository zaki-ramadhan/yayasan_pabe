"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText } from "@/lib/sanitizer";

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
	const [isCustomMode, setIsCustomMode] =
		useState(false);
	const [customCategories, setCustomCategories] =
		useState([]);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] =
		useState(false);

	const categoryList = useMemo(() => {
		return Array.from(
			new Set(
				[
					...DEFAULT_FAQ_CATEGORIES,
					...(categories ||
						[]),
					...customCategories,
				],
			),
		);
	}, [categories, customCategories]);

	useEffect(() => {
		setErrors({});
		if (faqToEdit) {
			setQuestion(
				faqToEdit.question ||
					"",
			);
			setAnswer(
				faqToEdit.answer ||
					"",
			);
			const cat =
				faqToEdit.category ||
				"Umum";
			setCategory(
				cat,
			);
			setIsCustomMode(
				!DEFAULT_FAQ_CATEGORIES.includes(
					cat,
				) &&
					!categories.includes(
						cat,
					),
			);
		} else {
			setQuestion(
				"",
			);
			setAnswer(
				"",
			);
			setCategory(
				"Umum",
			);
			setIsCustomMode(
				false,
			);
		}
	}, [faqToEdit, isOpen, categories]);

	const handleToggleCustomMode = () => {
		if (isCustomMode) {
			setIsCustomMode(
				false,
			);
			setCategory(
				categoryList[0] ||
					"Umum",
			);
		} else {
			setIsCustomMode(
				true,
			);
			setCategory(
				"",
			);
		}
		if (errors.category) {
			setErrors((prev) => ({ ...prev, category: "" }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!question.trim() || question.trim().length < 5) {
			newErrors.question = "Pertanyaan wajib diisi (minimal 5 karakter).";
		}
		if (isCustomMode && !category.trim()) {
			newErrors.category = "Nama topik baru wajib diisi.";
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
		const isCategoryValid = !isCustomMode || category.trim().length > 0;
		const isAnswerValid = answer.trim().length >= 10;
		return Boolean(isQuestionValid && isCategoryValid && isAnswerValid);
	}, [question, isCustomMode, category, answer]);

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
					maxLength={150}
					onChange={(e) => {
						setQuestion(sanitizeStandardText(e.target.value, 150));
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
				error={errors.category}
				action={
					<button
						type="button"
						onClick={handleToggleCustomMode}
						className="text-sm font-medium text-primary hover:underline cursor-pointer"
					>
						{isCustomMode
							? "Pilih dari daftar topik"
							: "+ Tambah topik baru"}
					</button>
				}
			>
				{isCustomMode ? (
					<Input
						type="text"
						placeholder="Tulis nama topik baru (misal: Relawan, Beasiswa)..."
						value={category}
						maxLength={50}
						onChange={(e) => {
							setCategory(sanitizeStandardText(e.target.value, 50));
							if (errors.category) {
								setErrors((prev) => ({ ...prev, category: "" }));
							}
						}}
						onBlur={() => setCategory((prev) => prev.trim())}
						className="h-10 text-sm font-normal bg-white border-slate-300"
						autoFocus
					/>
				) : (
					<Select
						value={category}
						onValueChange={(val) => {
							setCategory(val);
							if (errors.category) {
								setErrors((prev) => ({ ...prev, category: "" }));
							}
						}}
					>
						<SelectTrigger className="h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg w-full">
							<SelectValue placeholder="Pilih topik FAQ" />
						</SelectTrigger>
						<SelectContent className="bg-white border border-slate-200 z-50">
							{categoryList.map((cat) => (
								<SelectItem
									key={cat}
									value={cat}
									className="cursor-pointer text-sm font-normal py-2"
								>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</FormField>

			<FormField
				label="Jawaban lengkap"
				required
				error={errors.answer}
			>
				<Textarea
					rows={4}
					maxLength={3000}
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
