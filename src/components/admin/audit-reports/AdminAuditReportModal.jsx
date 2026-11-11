"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
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
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

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
		useState("12.4");
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
				String(report.operationalRatio || "12.4%").replace("%", "").trim()
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
				"12.4",
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
			operationalRatio: operationalRatio.trim()
				? `${operationalRatio.trim()}%`
				: "12.4%",
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
				operationalRatio: String(report.operationalRatio || "12.4%").replace("%", "").trim(),
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
					? "Edit laporan akuntabilitas & keuangan"
					: "Catat laporan akuntabilitas & keuangan baru"
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
						minLength={FIELD_LIMITS.AUDIT_YEAR.min}
						maxLength={FIELD_LIMITS.AUDIT_YEAR.max}
						value={year}
						onChange={(e) => {
							const clean = sanitizeDigitsOnly(e.target.value, FIELD_LIMITS.AUDIT_YEAR.max);
							setYear(clean);
							if (errors.year) {
								setErrors((prev) => ({ ...prev, year: "" }));
							}
						}}
						onBlur={() => setYear((prev) => prev.trim())}
						placeholder="2025"
						className="text-sm font-normal"
						required
					/>
				</FormField>

				<FormField
					label="Opini / Status akuntabilitas"
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
								Terbuka &amp; Akuntabel (Internal Yayasan)
							</SelectItem>
							<SelectItem value="WTP">
								WTP - Wajar Tanpa Pengecualian (KAP)
							</SelectItem>
							<SelectItem value="WDP">
								WDP - Wajar Dengan Pengecualian (KAP)
							</SelectItem>
							<SelectItem value="TMP">
								TMP - Tidak Menyatakan Pendapat (KAP)
							</SelectItem>
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField
				label="Penyusun laporan / Kantor Akuntan Publik (KAP)"
				required
				error={errors.auditorName}
			>
				<Input
					value={auditorName}
					minLength={FIELD_LIMITS.AUDITOR_NAME.min}
					maxLength={FIELD_LIMITS.AUDITOR_NAME.max}
					onChange={(e) => {
						const clean = sanitizeStandardText(e.target.value, FIELD_LIMITS.AUDITOR_NAME.max);
						setAuditorName(clean);
						if (errors.auditorName) {
							setErrors((prev) => ({ ...prev, auditorName: "" }));
						}
					}}
					onBlur={() => setAuditorName((prev) => prev.trim())}
					placeholder="Contoh: Internal Pembukuan Yayasan atau KAP Ahmad & Rekan"
					className="text-sm font-normal"
					required
				/>
			</FormField>

			<FormField label="Judul resmi laporan">
				<Input
					value={title}
					minLength={FIELD_LIMITS.AUDIT_TITLE.min}
					maxLength={FIELD_LIMITS.AUDIT_TITLE.max}
					onChange={(e) => setTitle(sanitizeStandardText(e.target.value, FIELD_LIMITS.AUDIT_TITLE.max))}
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
						minLength={FIELD_LIMITS.AUDIT_AMOUNT.min}
						maxLength={FIELD_LIMITS.AUDIT_AMOUNT.max}
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
						minLength={FIELD_LIMITS.AUDIT_AMOUNT.min}
						maxLength={FIELD_LIMITS.AUDIT_AMOUNT.max}
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

			{Boolean(
				parseThousandsToNumber(totalFundsIn) > 0 &&
				parseThousandsToNumber(totalFundsOut) > parseThousandsToNumber(totalFundsIn)
			) && (
				<div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
					<p className="font-medium text-amber-900 dark:text-amber-200">
						Perhatian: Penyaluran melebihi penghimpunan tahun berjalan
					</p>
					<p className="mt-0.5 text-amber-700 dark:text-amber-400">
						Terdapat defisit kas berjalan. Pastikan mencantumkan catatan penggunaan saldo kas cadangan tahun sebelumnya pada ringkasan laporan.
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<FormField
					label="Jumlah penerima manfaat (orang)"
					required
					error={errors.beneficiaryCount}
				>
					<Input
						value={beneficiaryCount}
						minLength={1}
						maxLength={15}
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
					<div className="relative w-full flex items-center">
						<Input
							type="text"
							inputMode="decimal"
							value={operationalRatio}
							onChange={(e) => {
								// Hanya izinkan angka dan satu titik desimal
								let val = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
								const parts = val.split(".");
								if (parts.length > 2) {
									val = `${parts[0]}.${parts.slice(1).join("")}`;
								}
								// Batasi maksimal 100% dan maksimal 2 desimal
								const num = parseFloat(val);
								if (!isNaN(num) && num > 100) return;
								setOperationalRatio(val);
							}}
							onBlur={() => {
								const trimmed = operationalRatio.trim();
								if (!trimmed) {
									setOperationalRatio("12.4");
								} else {
									const parsed = parseFloat(trimmed);
									setOperationalRatio(isNaN(parsed) ? "12.4" : String(parsed));
								}
							}}
							placeholder="12.4"
							className="text-sm font-normal pr-8 tabular-nums"
						/>
						<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none select-none">
							%
						</span>
					</div>
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
				label="Berkas dokumen fisik laporan (PDF)"
				helperText="Format dokumen PDF resmi (Maks. 15MB). Kosongkan jika ingin sistem men-generate berkas PDF resmi otomatis."
				accept="application/pdf"
				error={errors.pdfUrl}
			/>

			<FormField label="Ringkasan catatan akuntabilitas & transparansi">
				<AutoResizeTextarea
					value={summary}
					minLength={FIELD_LIMITS.AUDIT_SUMMARY.min}
					maxLength={FIELD_LIMITS.AUDIT_SUMMARY.max}
					onChange={(e) => setSummary(e.target.value)}
					onBlur={() => setSummary((prev) => prev.trim())}
					placeholder="Catatan ringkas opini dan transparansi..."
					minRows={3}
					maxRows={10}
					className="text-sm font-normal"
				/>
			</FormField>
		</FormDialog>
	);
}
