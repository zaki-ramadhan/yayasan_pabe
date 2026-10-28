/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";

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
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setErrors({});
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
								images:
									distributionToEdit?.images ||
									[],
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
		} catch {
			toast.error(
				"Terjadi kendala jaringan saat menyimpan penyaluran.",
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
					? "Edit rekam penyaluran donasi"
					: "Catat penyaluran donasi ke mustahik"
			}
			isSubmitting={
				isSubmitting
			}
			submitText={
				isEditing
					? "Simpan perubahan"
					: "Simpan penyaluran"
			}
			submittingText="Menyimpan..."
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
					placeholder="Pilih program donasi terkait..."
					searchPlaceholder="Ketik untuk mencari program donasi..."
					emptyMessage="Program donasi tidak ditemukan."
				/>
			</FormField>

			<FormField
				label="Judul kegiatan penyaluran"
				required
				error={errors.title}
			>
				<Input
					type="text"
					placeholder="Contoh: Penyaluran Paket Sembako & Santunan 50 Yatim Dhuafa"
					value={title}
					maxLength={120}
					onChange={(e) => {
						setTitle(e.target.value);
						if (errors.title) {
							setErrors((prev) => ({ ...prev, title: "" }));
						}
					}}
					className="h-10 text-sm font-normal text-slate-900 border-slate-300 rounded-lg"
					required
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
				<FormField
					label="Alokasi dana tersalurkan (Rp)"
					required
					error={errors.disbursedAmount}
				>
					<CurrencyInput
						placeholder="0"
						value={disbursedAmount}
						onChange={(val) => {
							setDisbursedAmount(val);
							if (errors.disbursedAmount) {
								setErrors((prev) => ({ ...prev, disbursedAmount: "" }));
							}
						}}
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
					placeholder="Rincian jumlah penerima manfaat, lokasi penyerahan, dan ucapan doa dari mustahik..."
					value={content}
					onChange={(e) => {
						setContent(e.target.value);
						if (errors.content) {
							setErrors((prev) => ({ ...prev, content: "" }));
						}
					}}
					className="w-full text-sm font-normal leading-relaxed border-slate-300"
					required
				/>
			</FormField>
		</FormDialog>
	);
}
