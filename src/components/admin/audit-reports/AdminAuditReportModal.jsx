"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { formatThousandsInput, parseThousandsToNumber } from "@/lib/formatters";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeDigitsOnly, sanitizeStandardText } from "@/lib/sanitizer";
import { useStagedUploads } from "@/hooks/useStagedUploads";

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
		useState("Terbuka & Akuntabel");
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

	const { trackUpload, commitUploads, discardUploads } = useStagedUploads();

	const handleClose = () => {
		discardUploads();
		onClose();
	};

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

	const handleSubmit = async (e) => {
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

		commitUploads();
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
				(pdfUrl && typeof pdfUrl === "string"
					? pdfUrl.trim()
					: null) || null,
			summary:
				summary.trim() ||
				null,
		});
	};

	const isDirty = useMemo(() => {
		const hasFileOrUrl = Boolean(pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim());

		if (!isEdit || !report) {
			return Boolean(
				year.trim() ||
					title.trim() ||
					auditorName.trim() ||
					hasFileOrUrl
			);
		}
		return isFormDirty(
			{
				year: String(report.year || ""),
				title: report.title || "",
				auditorName: report.auditorName || "",
				opinionStatus: report.opinionStatus || "WTP",
				totalFundsIn: String(report.totalFundsIn || ""),
				totalFundsOut: String(report.totalFundsOut || ""),
				beneficiaryCount: String(report.beneficiaryCount || ""),
				operationalRatio: report.operationalRatio || "12.4%",
				pdfUrl: report.pdfUrl || "",
				summary: report.summary || "",
			},
			{
				year,
				title,
				auditorName,
				opinionStatus,
				totalFundsIn: parseThousandsToNumber(totalFundsIn) ? String(parseThousandsToNumber(totalFundsIn)) : "",
				totalFundsOut: parseThousandsToNumber(totalFundsOut) ? String(parseThousandsToNumber(totalFundsOut)) : "",
				beneficiaryCount: parseThousandsToNumber(beneficiaryCount) ? String(parseThousandsToNumber(beneficiaryCount)) : "",
				operationalRatio,
				pdfUrl: pdfUrl || "",
				summary,
			}
		);
	}, [
		isEdit,
		report,
		year,
		title,
		auditorName,
		opinionStatus,
		totalFundsIn,
		totalFundsOut,
		beneficiaryCount,
		operationalRatio,
		pdfUrl,
		summary,
	]);

	const isFormValid = useMemo(() => {
		const parsedYear = parseInt(year, 10);
		const isYearValid = Boolean(year && !isNaN(parsedYear) && parsedYear >= 2015 && parsedYear <= 2050);
		return Boolean(
			isYearValid &&
			auditorName.trim().length >= 3 &&
			totalFundsIn.trim() &&
			totalFundsOut.trim() &&
			beneficiaryCount.trim()
		);
	}, [year, auditorName, totalFundsIn, totalFundsOut, beneficiaryCount]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={handleClose}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={
				isEdit
					? "Edit laporan audit tahunan"
					: "Catat laporan audit tahunan baru"
			}
			isSubmitting={isSubmitting}
			submitText="Simpan"
			submittingText="Menyimpan..."
			submitDisabled={!isFormValid || (isEdit && !isDirty)}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<FormField
					label="Tahun buku laporan"
					required
					error={errors.year}
				>
					<Input
						type="text"
						inputMode="numeric"
						maxLength={4}
						value={year}
						onChange={(e) => {
							const clean = sanitizeDigitsOnly(e.target.value, 4);
							setYear(clean);
							if (errors.year) {
								setErrors((prev) => ({ ...prev, year: "" }));
							}
						}}
						onBlur={() => setYear((prev) => prev.trim())}
						placeholder="2024"
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
							<SelectItem value="Terbuka & Akuntabel">
								Terbuka &amp; Akuntabel (Internal)
							</SelectItem>
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
					maxLength={100}
					onChange={(e) => {
						const clean = sanitizeStandardText(e.target.value, 100);
						setAuditorName(clean);
						if (errors.auditorName) {
							setErrors((prev) => ({ ...prev, auditorName: "" }));
						}
					}}
					onBlur={() => setAuditorName((prev) => prev.trim())}
					placeholder="Contoh: KAP Ahmad, Rasyid & Rekan (Registered Public Accountants)"
					className="text-sm font-normal"
					required
				/>
			</FormField>

			<FormField label="Judul resmi laporan">
				<Input
					value={title}
					maxLength={150}
					onChange={(e) => setTitle(sanitizeStandardText(e.target.value, 150))}
					onBlur={() => setTitle((prev) => prev.trim())}
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
						value={operationalRatio}
						maxLength={20}
						onChange={(e) => setOperationalRatio(sanitizeStandardText(e.target.value, 20))}
						onBlur={() => setOperationalRatio((prev) => prev.trim())}
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
				onUploadSuccess={trackUpload}
				label="Berkas laporan audit resmi (PDF)"
				helperText="Format dokumen PDF resmi (Maks. 15MB) atau gunakan tautan dokumen."
				accept="application/pdf"
				error={errors.pdfUrl}
			/>

			<FormField label="Ringkasan catatan auditor">
				<Textarea
					value={summary}
					maxLength={500}
					onChange={(e) => setSummary(e.target.value)}
					onBlur={() => setSummary((prev) => prev.trim())}
					placeholder="Catatan ringkas opini dan transparansi..."
					rows={3}
					className="text-sm font-normal"
				/>
			</FormField>
		</FormDialog>
	);
}
