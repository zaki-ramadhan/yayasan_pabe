"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

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
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!question.trim()) {
			toast.error(
				"Pertanyaan wajib diisi.",
			);
			return;
		}
		if (!answer.trim()) {
			toast.error(
				"Jawaban wajib diisi.",
			);
			return;
		}

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
					? "Edit tanya jawab (FAQ)"
					: "Tambah tanya jawab (FAQ) baru"
			}
			isSubmitting={
				isSubmitting
			}
			submitText={
				isEditing
					? "Simpan perubahan"
					: "Simpan FAQ"
			}
			submittingText="Menyimpan..."
		>
			<FormField
				label="Pertanyaan"
				required
			>
				<Input
					type="text"
					placeholder="Contoh: Bagaimana cara donatur mendapatkan kuitansi resmi?"
					value={
						question
					}
					onChange={(
						e,
					) =>
						setQuestion(
							e
								.target
								.value,
						)
					}
					required
					className="h-10 text-sm font-normal bg-white border-slate-300"
				/>
			</FormField>

			<FormField
				label="Kategori / topik"
				action={
					<button
						type="button"
						onClick={
							handleToggleCustomMode
						}
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
						value={
							category
						}
						onChange={(
							e,
						) =>
							setCategory(
								e
									.target
									.value,
							)
						}
						className="h-10 text-sm font-normal bg-white border-slate-300"
						autoFocus
					/>
				) : (
					<Select
						value={
							category
						}
						onValueChange={(
							val,
						) =>
							setCategory(
								val,
							)
						}
					>
						<SelectTrigger className="h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg w-full">
							<SelectValue placeholder="Pilih topik FAQ" />
						</SelectTrigger>
						<SelectContent className="bg-white border border-slate-200 z-50">
							{categoryList.map(
								(
									cat,
								) => (
									<SelectItem
										key={
											cat
										}
										value={
											cat
										}
										className="cursor-pointer text-sm font-normal py-2"
									>
										{
											cat
										}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				)}
			</FormField>

			<FormField
				label="Jawaban lengkap"
				required
			>
				<Textarea
					rows={
						4
					}
					placeholder="Tuliskan jawaban yang ramah, informatif, dan jelas bagi calon donatur..."
					value={
						answer
					}
					onChange={(
						e,
					) =>
						setAnswer(
							e
								.target
								.value,
						)
					}
					required
					className="w-full text-sm font-normal leading-relaxed bg-white border-slate-300"
				/>
			</FormField>
		</FormDialog>
	);
}
