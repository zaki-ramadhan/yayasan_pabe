"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { AdminCareerBasicInfoFields } from "./AdminCareerBasicInfoFields";
import { AdminCareerDetailFields } from "./AdminCareerDetailFields";
import {
	TYPE_OPTIONS,
	LOCATION_OPTIONS,
	CONTRACT_DURATION_OPTIONS,
	formatWorkplace,
} from "@/data/careers";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { isFormDirty } from "@/lib/formUtils";

const INITIAL_LOCATIONS = LOCATION_OPTIONS.filter((l) => l !== "Semua Lokasi");
const EMPLOYMENT_TYPES = TYPE_OPTIONS.filter((t) => t !== "Semua Tipe");

export function AdminCareerModal({
	isOpen,
	onOpenChange,
	vacancyToEdit = null,
	onSuccess,
}) {
	const isEditing = Boolean(vacancyToEdit);

	const [title, setTitle] = useState("");
	const [location, setLocation] = useState(
		"Jakarta Timur / Depok",
	);
	const [locationList, setLocationList] =
		useState(INITIAL_LOCATIONS);
	const [type, setType] = useState(
		"Penuh Waktu (Full-time)",
	);
	const [contractDuration, setContractDuration] = useState("");
	const [durationList, setDurationList] =
		useState(CONTRACT_DURATION_OPTIONS);
	const [workplace, setWorkplace] = useState("Kerja di lokasi");
	const [experience, setExperience] =
		useState("1 - 3 tahun");
	const [deadline, setDeadline] = useState("");
	const [overview, setOverview] = useState("");
	const [
		responsibilitiesText,
		setResponsibilitiesText,
	] = useState("");
	const [requirementsText, setRequirementsText] =
		useState("");
	const [benefitsText, setBenefitsText] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [requiresResume, setRequiresResume] = useState(true);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] =
		useState(false);

	const handleClearError = (field) => {
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleCreateLocation = (newLoc) => {
		const trimmed =
			newLoc.trim();
		if (trimmed) {
			setLocationList(
				(
					prev,
				) =>
					Array.from(
						new Set(
							[
								...prev,
								trimmed,
							],
						),
					),
			);
			setLocation(
				trimmed,
			);
			handleClearError("location");
			toast.success(
				`Lokasi "${trimmed}" siap digunakan.`,
			);
			return trimmed;
		}
	};

	const handleCreateDuration = (newDuration) => {
		const trimmed = newDuration.trim();
		if (trimmed) {
			setDurationList((prev) =>
				Array.from(new Set([...prev, trimmed]))
			);
			setContractDuration(trimmed);
			handleClearError("contractDuration");
			toast.success(`Durasi "${trimmed}" siap digunakan.`);
			return trimmed;
		}
	};

	useEffect(() => {
		setErrors({});
		if (vacancyToEdit) {
			setTitle(
				vacancyToEdit.title ||
					"",
			);
			setLocation(
				vacancyToEdit.location ||
					"Jakarta Timur / Depok",
			);
			setWorkplace(
				formatWorkplace(vacancyToEdit.workplace || "Kerja di lokasi"),
			);
			const rawType = vacancyToEdit.type || "Penuh Waktu (Full-time)";
			const contractMatch = rawType.match(/^Kontrak \/ Project \((.+)\)$/);
			if (contractMatch) {
				const dur = contractMatch[1];
				setType("Kontrak / Project");
				setContractDuration(dur);
				setDurationList((prev) =>
					Array.from(new Set([...prev, dur]))
				);
			} else {
				setType(rawType);
				setContractDuration("");
			}
			setExperience(
				vacancyToEdit.experience ||
					"1 - 3 tahun",
			);
			setDeadline(
				vacancyToEdit.deadline || "",
			);
			setOverview(
				vacancyToEdit.overview ||
					"",
			);
			setResponsibilitiesText(
				(
					vacancyToEdit.responsibilities ||
					[]
				).join(
					"\n",
				),
			);
			setRequirementsText(
				(
					vacancyToEdit.requirements ||
					[]
				).join(
					"\n",
				),
			);
			setBenefitsText(
				(
					vacancyToEdit.benefits ||
					[]
				).join(
					"\n",
				),
			);
			setIsActive(
				vacancyToEdit.isActive !==
					undefined
					? vacancyToEdit.isActive
					: true,
			);
			setRequiresResume(
				vacancyToEdit.requiresResume !== undefined
					? Boolean(vacancyToEdit.requiresResume)
					: vacancyToEdit.applyUrl !== "WITHOUT_RESUME"
			);
		} else {
			setTitle(
				"",
			);
			setLocation(
				"Jakarta Timur / Depok",
			);
			setType(
				"Penuh Waktu (Full-time)",
			);
			setContractDuration("");
			setDurationList(CONTRACT_DURATION_OPTIONS);
			setWorkplace("Kerja di lokasi");
			setExperience(
				"1 - 3 tahun",
			);
			setDeadline("");
			setOverview(
				"",
			);
			setResponsibilitiesText(
				"",
			);
			setRequirementsText(
				"",
			);
			setBenefitsText(
				"",
			);
			setIsActive(
				true,
			);
			setRequiresResume(
				true,
			);
		}
	}, [vacancyToEdit, isOpen]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		if (!title.trim() || title.trim().length < 3) {
			newErrors.title = "Nama posisi pekerjaan wajib diisi (minimal 3 karakter).";
		}
		if (!location) {
			newErrors.location = "Lokasi penempatan wajib dipilih.";
		}
		if (type === "Kontrak / Project" && !contractDuration.trim()) {
			newErrors.contractDuration = "Durasi kontrak / proyek wajib diisi.";
		}
		if (!overview.trim() || overview.trim().length < 10) {
			newErrors.overview = "Deskripsi ringkasan posisi wajib diisi (minimal 10 karakter).";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
			return;
		}

		setErrors({});

		const responsibilities =
			responsibilitiesText
				.split(
					"\n",
				)
				.map(
					(
						s,
					) =>
						s.trim(),
				)
				.filter(
					Boolean,
				);
		const requirements =
			requirementsText
				.split(
					"\n",
				)
				.map(
					(
						s,
					) =>
						s.trim(),
				)
				.filter(
					Boolean,
				);
		const benefits =
			benefitsText
				.split(
					"\n",
				)
				.map(
					(
						s,
					) =>
						s.trim(),
				)
				.filter(
					Boolean,
				);

		setIsSubmitting(true);
		try {
			const url =
				isEditing
					? `/api/admin/careers/${vacancyToEdit.id}`
					: "/api/admin/careers";
			const method =
				isEditing
					? "PUT"
					: "POST";

			const effectiveType =
				type === "Kontrak / Project" && contractDuration.trim()
					? `Kontrak / Project (${contractDuration.trim()})`
					: type;

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
								title,
								department: vacancyToEdit?.department || "Umum",
								location,
								type: effectiveType,
								workplace,
								experience,
								deadline,
								overview,
								responsibilities,
								requirements,
								benefits,
								isActive,
								requiresResume,
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
						? "Lowongan berhasil diperbarui."
						: "Lowongan pekerjaan baru berhasil dibuat.",
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
						"Gagal menyimpan lowongan.",
				);
			}
		} catch {
			toast.error(
				"Terjadi kendala jaringan saat menyimpan lowongan.",
			);
		} finally {
			setIsSubmitting(
				false,
			);
		}
	};

	const isDirty = useMemo(() => {
		if (!isEditing || !vacancyToEdit) {
			return Boolean(title.trim() || overview.trim() || requirementsText.trim());
		}
		const initialResponsibilities = Array.isArray(vacancyToEdit.responsibilities)
			? vacancyToEdit.responsibilities.join("\n")
			: "";
		const initialRequirements = Array.isArray(vacancyToEdit.requirements)
			? vacancyToEdit.requirements.join("\n")
			: "";
		const initialBenefits = Array.isArray(vacancyToEdit.benefits)
			? vacancyToEdit.benefits.join("\n")
			: "";
		const initialRequiresResume =
			vacancyToEdit.requiresResume !== undefined
				? Boolean(vacancyToEdit.requiresResume)
				: vacancyToEdit.applyUrl !== "WITHOUT_RESUME";

		const initialTypeRaw = vacancyToEdit.type || "Penuh Waktu (Full-time)";
		const initialContractMatch = initialTypeRaw.match(/^Kontrak \/ Project \((.+)\)$/);
		const initialType = initialContractMatch ? "Kontrak / Project" : initialTypeRaw;
		const initialDuration = initialContractMatch ? initialContractMatch[1] : "";

		return isFormDirty(
			{
				title: vacancyToEdit.title || "",
				location: vacancyToEdit.location || "Jakarta Timur / Depok",
				type: initialType,
				contractDuration: initialDuration,
				workplace: formatWorkplace(vacancyToEdit.workplace || "Kerja di lokasi"),
				experience: vacancyToEdit.experience || "1 - 3 tahun",
				deadline: vacancyToEdit.deadline || "",
				overview: vacancyToEdit.overview || "",
				responsibilities: initialResponsibilities,
				requirements: initialRequirements,
				benefits: initialBenefits,
				requiresResume: initialRequiresResume,
			},
			{
				title,
				location,
				type,
				contractDuration,
				workplace,
				experience,
				deadline,
				overview,
				responsibilities: responsibilitiesText,
				requirements: requirementsText,
				benefits: benefitsText,
				requiresResume,
			}
		);
	}, [
		isEditing,
		vacancyToEdit,
		title,
		location,
		type,
		contractDuration,
		workplace,
		experience,
		deadline,
		overview,
		responsibilitiesText,
		requirementsText,
		benefitsText,
		requiresResume,
	]);

	const isFormValid = useMemo(() => {
		const isBasicValid =
			title.trim().length >= 3 &&
			location &&
			overview.trim().length >= 10;
		const isContractValid =
			type !== "Kontrak / Project" || contractDuration.trim().length > 0;
		return Boolean(isBasicValid && isContractValid);
	}, [title, location, overview, type, contractDuration]);

	return (
		<FormDialog
			isOpen={isOpen}
			onClose={() => onOpenChange(false)}
			onSubmit={handleSubmit}
			maxWidth="max-w-2xl"
			title={
				isEditing
					? "Edit lowongan pekerjaan"
					: "Buka lowongan pekerjaan baru"
			}
			isSubmitting={isSubmitting}
			submitText="Simpan"
			submittingText="Menyimpan..."
			submitDisabled={isEditing && !isDirty}
		>
			<AdminCareerBasicInfoFields
				title={title}
				onTitleChange={setTitle}
				type={type}
				onTypeChange={setType}
				employmentTypes={EMPLOYMENT_TYPES}
				contractDuration={contractDuration}
				onContractDurationChange={setContractDuration}
				durationList={durationList}
				onCreateDuration={handleCreateDuration}
				workplace={workplace}
				onWorkplaceChange={setWorkplace}
				location={location}
				onLocationChange={setLocation}
				locationList={locationList}
				onCreateLocation={handleCreateLocation}
				experience={experience}
				onExperienceChange={setExperience}
				deadline={deadline}
				onDeadlineChange={setDeadline}
				isActive={isActive}
				onIsActiveChange={setIsActive}
				requiresResume={requiresResume}
				onRequiresResumeChange={setRequiresResume}
				errors={errors}
				onClearError={handleClearError}
			/>

			<AdminCareerDetailFields
				overview={overview}
				onOverviewChange={setOverview}
				responsibilitiesText={responsibilitiesText}
				onResponsibilitiesChange={setResponsibilitiesText}
				requirementsText={requirementsText}
				onRequirementsChange={setRequirementsText}
				errors={errors}
				onClearError={handleClearError}
			/>
		</FormDialog>
	);
}
