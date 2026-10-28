"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatThousandsInput, parseThousandsToNumber } from "@/lib/formatters";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";

export function AdminAuditReportModal({
	report,
	isOpen,
	onClose,
	onSubmit,
	isSubmitting = false,
}) {
	const isEdit = Boolean(report);
	const [year, setYear] = useState("");
	const [title, setTitle] = useState("");
	const [auditorName, setAuditorName] = useState("");
	const [opinionStatus, setOpinionStatus] =
		useState("WTP");
	const [totalFundsIn, setTotalFundsIn] = useState("");
	const [totalFundsOut, setTotalFundsOut] =
		useState("");
	const [beneficiaryCount, setBeneficiaryCount] =
		useState("");
	const [operationalRatio, setOperationalRatio] =
		useState("12.4%");
	const [pdfUrl, setPdfUrl] = useState("");
	const [summary, setSummary] = useState("");
	const [errors, setErrors] = useState({});

	useEffect(() => {
		setErrors({});
		if (report) {
			setYear(
				String(
					report.year ||
						"",
				),
			);
			setTitle(
				report.title ||
					"",
			);
			setAuditorName(
				report.auditorName ||
					"",
			);
			setOpinionStatus(
				report.opinionStatus ||
					"WTP",
			);
			setTotalFundsIn(
				formatThousandsInput(
					report.totalFundsIn ||
						0,
				),
			);
			setTotalFundsOut(
				formatThousandsInput(
					report.totalFundsOut ||
						0,
				),
			);
			setBeneficiaryCount(
				formatThousandsInput(
					report.beneficiaryCount ||
						0,
				),
			);
			setOperationalRatio(
				report.operationalRatio ||
					"12.4%",
			);
			setPdfUrl(
				report.pdfUrl ||
					"",
			);
			setSummary(
				report.summary ||
					"",
			);
		} else {
			const currentYear =
				new Date().getFullYear();
			setYear(
				String(
					currentYear -
						1,
				),
			);
			setTitle(
				`Laporan Keuangan & Audit Independen ${currentYear - 1}`,
			);
			setAuditorName(
				"",
			);
			setOpinionStatus(
				"WTP",
			);
			setTotalFundsIn(
				"",
			);
			setTotalFundsOut(
				"",
			);
			setBeneficiaryCount(
				"",
			);
			setOperationalRatio(
				"12.4%",
			);
			setPdfUrl(
				"",
			);
			setSummary(
				"Laporan keuangan menyajikan secara wajar, dalam semua hal yang material, posisi keuangan yayasan sesuai dengan Standar Akuntansi Keuangan di Indonesia.",
			);
		}
	}, [report, isOpen]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const newErrors = {};

		const parsedYear = parseInt(year, 10);
		if (!year || isNaN(parsedYear) || parsedYear < 2015 || parsedYear > 2050) {
			newErrors.year = "Tahun buku harus berupa 4 digit tahun yang valid (2015-2050).";
		}
		if (!auditorName.trim() || auditorName.trim().length < 3) {
			newErrors.auditorName = "Nama kantor akuntan publik / auditor wajib diisi (minimal 3 karakter).";
		}
		if (!totalFundsIn.trim()) {
			newErrors.totalFundsIn = "Total penghimpunan dana wajib diisi.";
		}
		if (!totalFundsOut.trim()) {
			newErrors.totalFundsOut = "Total penyaluran donasi wajib diisi.";
		}
		if (!beneficiaryCount.trim()) {
			newErrors.beneficiaryCount = "Jumlah penerima manfaat wajib diisi.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		onSubmit({
			...(report
				? {
						id: report.id,
					}
				: {}),
			year: parsedYear,
			title:
				title.trim() ||
				`Laporan Keuangan & Audit Tahun ${year}`,
			auditorName: auditorName.trim(),
			opinionStatus,
			totalFundsIn: parseThousandsToNumber(
				totalFundsIn,
			),
			totalFundsOut: parseThousandsToNumber(
				totalFundsOut,
			),
			beneficiaryCount: parseThousandsToNumber(
				beneficiaryCount,
			),
			operationalRatio: operationalRatio.trim(),
			pdfUrl:
				pdfUrl.trim() ||
				null,
			summary:
				summary.trim() ||
				null,
		});
	};

	return (
		<FormDialog
			isOpen={
				isOpen
			}
			onClose={
				onClose
			}
			onSubmit={
				handleSubmit
			}
			maxWidth="max-w-2xl"
			title={
				isEdit
					? "Edit laporan audit tahunan"
					: "Catat laporan audit tahunan baru"
			}
			isSubmitting={isSubmitting}
			submitText={
				isEdit
					? "Simpan perubahan"
					: "Tambah laporan"
			}
			submittingText="Menyimpan..."
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<FormField
					label="Tahun buku laporan"
					required
					error={errors.year}
				>
					<Input
						type="number"
						value={year}
						onChange={(e) => {
							setYear(e.target.value);
							if (errors.year) {
								setErrors((prev) => ({ ...prev, year: "" }));
							}
						}}
						placeholder="2024"
						min={2015}
						max={2050}
						className="text-sm font-normal"
						required
					/>
				</FormField>

				<FormField
					label="Opini audit independen"
					required
				>
					<Select
						value={opinionStatus}
						onValueChange={setOpinionStatus}
					>
						<SelectTrigger className="h-10 text-sm font-normal bg-white">
							<SelectValue placeholder="Pilih opini" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="WTP">
								WTP (Wajar Tanpa Pengecualian)
							</SelectItem>
							<SelectItem value="WDP">
								WDP (Wajar Dengan Pengecualian)
							</SelectItem>
							<SelectItem value="TMP">
								TMP (Tidak Menyatakan Pendapat)
							</SelectItem>
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField
				label="Nama kantor akuntan publik / auditor independen"
				required
				error={errors.auditorName}
			>
				<Input
					value={auditorName}
					onChange={(e) => {
						setAuditorName(e.target.value);
						if (errors.auditorName) {
							setErrors((prev) => ({ ...prev, auditorName: "" }));
						}
					}}
					placeholder="Contoh: KAP Ahmad, Rasyid & Rekan (Registered Public Accountants)"
					className="text-sm font-normal"
					required
				/>
			</FormField>

			<FormField label="Judul resmi laporan">
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Contoh: Laporan Audit Keuangan & Transparansi 2024"
					className="text-sm font-normal"
				/>
			</FormField>

			{/* Angka Keuangan dengan Thousand Separator */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<FormField
					label="Total penghimpunan dana (Rp)"
					required
					error={errors.totalFundsIn}
				>
					<Input
						value={totalFundsIn}
						onChange={(e) => {
							setTotalFundsIn(formatThousandsInput(e.target.value));
							if (errors.totalFundsIn) {
								setErrors((prev) => ({ ...prev, totalFundsIn: "" }));
							}
						}}
						placeholder="0"
						className="text-sm font-normal"
						required
					/>
				</FormField>

				<FormField
					label="Total penyaluran donasi (Rp)"
					required
					error={errors.totalFundsOut}
				>
					<Input
						value={totalFundsOut}
						onChange={(e) => {
							setTotalFundsOut(formatThousandsInput(e.target.value));
							if (errors.totalFundsOut) {
								setErrors((prev) => ({ ...prev, totalFundsOut: "" }));
							}
						}}
						placeholder="0"
						className="text-sm font-normal"
						required
					/>
				</FormField>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<FormField
					label="Jumlah penerima manfaat (orang)"
					required
					error={errors.beneficiaryCount}
				>
					<Input
						value={beneficiaryCount}
						onChange={(e) => {
							setBeneficiaryCount(formatThousandsInput(e.target.value));
							if (errors.beneficiaryCount) {
								setErrors((prev) => ({ ...prev, beneficiaryCount: "" }));
							}
						}}
						placeholder="0"
						className="text-sm font-normal"
						required
					/>
				</FormField>

				<FormField label="Rasio operasional yayasan">
					<Input
						value={
							operationalRatio
						}
						onChange={(
							e,
						) =>
							setOperationalRatio(
								e
									.target
									.value,
							)
						}
						placeholder="Contoh: 12.4%"
						className="text-sm font-normal"
					/>
				</FormField>
			</div>

			{/* Berkas PDF Laporan Resmi */}
			<FileUploadZone
				value={pdfUrl}
				onChange={setPdfUrl}
				isPdf={true}
				context="AUDIT_REPORT"
				identifier={`audit-${year || "laporan"}`}
				label="Berkas laporan audit resmi (PDF)"
				helperText="Format dokumen PDF resmi (Maks. 15MB). Otomatis disimpan ke Cloudflare R2 atau gunakan tautan dokumen."
				accept="application/pdf"
				error={errors.pdfUrl}
			/>

			<FormField label="Ringkasan catatan auditor">
				<Textarea
					value={
						summary
					}
					onChange={(
						e,
					) =>
						setSummary(
							e
								.target
								.value,
						)
					}
					placeholder="Catatan ringkas opini dan transparansi..."
					rows={
						3
					}
					className="text-sm font-normal"
				/>
			</FormField>
		</FormDialog>
	);
}
