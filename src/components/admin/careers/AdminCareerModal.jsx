"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { AdminCareerBasicInfoFields } from "./AdminCareerBasicInfoFields";
import { AdminCareerDetailFields } from "./AdminCareerDetailFields";
import {
	DEPARTMENT_OPTIONS,
	TYPE_OPTIONS,
	LOCATION_OPTIONS,
} from "@/data/careers";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

const INITIAL_DEPARTMENTS = DEPARTMENT_OPTIONS.filter(
	(d) => d !== "Semua Divisi",
);
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
	const [department, setDepartment] = useState(
		"Operasional & Penyaluran",
	);
	const [departmentList, setDepartmentList] =
		useState(
			INITIAL_DEPARTMENTS,
		);
	const [location, setLocation] = useState(
		"Jakarta Timur / Depok",
	);
	const [locationList, setLocationList] =
		useState(INITIAL_LOCATIONS);
	const [type, setType] = useState(
		"Penuh Waktu (Full-time)",
	);
	const [workplace, setWorkplace] = useState("On-site");
	const [experience, setExperience] =
		useState("1 - 3 tahun");
	const [deadline, setDeadline] =
		useState(
			"30 November 2026",
		);
	const [overview, setOverview] = useState("");
	const [
		responsibilitiesText,
		setResponsibilitiesText,
	] = useState("");
	const [requirementsText, setRequirementsText] =
		useState("");
	const [benefitsText, setBenefitsText] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [isSubmitting, setIsSubmitting] =
		useState(false);

	const handleCreateDepartment = (newDept) => {
		const trimmed =
			newDept.trim();
		if (trimmed) {
			setDepartmentList(
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
			setDepartment(
				trimmed,
			);
			toast.success(
				`Divisi "${trimmed}" siap digunakan.`,
			);
			return trimmed;
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
			toast.success(
				`Lokasi "${trimmed}" siap digunakan.`,
			);
			return trimmed;
		}
	};

	useEffect(() => {
		if (vacancyToEdit) {
			setTitle(
				vacancyToEdit.title ||
					"",
			);
			setDepartment(
				vacancyToEdit.department ||
					"Operasional & Penyaluran",
			);
			setLocation(
				vacancyToEdit.location ||
					"Jakarta Timur / Depok",
			);
			setType(
				vacancyToEdit.type ||
					"Penuh Waktu (Full-time)",
			);
			setWorkplace(
				vacancyToEdit.workplace ||
					"On-site",
			);
			setExperience(
				vacancyToEdit.experience ||
					"1 - 3 tahun",
			);
			setDeadline(
				vacancyToEdit.deadline ||
					"30 November 2026",
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
		} else {
			setTitle(
				"",
			);
			setDepartment(
				"Operasional & Penyaluran",
			);
			setLocation(
				"Jakarta Timur / Depok",
			);
			setType(
				"Penuh Waktu (Full-time)",
			);
			setWorkplace(
				"On-site",
			);
			setExperience(
				"1 - 3 tahun",
			);
			setDeadline(
				"30 November 2026",
			);
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
		}
	}, [vacancyToEdit, isOpen]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error(
				"Nama posisi pekerjaan wajib diisi.",
			);
			return;
		}
		if (!overview.trim()) {
			toast.error(
				"Deskripsi ringkasan posisi wajib diisi.",
			);
			return;
		}

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
								department,
								location,
								type,
								workplace,
								experience,
								deadline,
								overview,
								responsibilities,
								requirements,
								benefits,
								isActive,
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
			maxWidth="max-w-2xl"
			title={
				isEditing
					? "Edit Lowongan Pekerjaan"
					: "Buka Lowongan Pekerjaan Baru"
			}
			isSubmitting={
				isSubmitting
			}
			submitText={
				isEditing
					? "Simpan Perubahan"
					: "Terbitkan Lowongan"
			}
			submittingText="Menyimpan..."
		>
			<AdminCareerBasicInfoFields
				title={
					title
				}
				onTitleChange={
					setTitle
				}
				department={
					department
				}
				onDepartmentChange={
					setDepartment
				}
				departmentList={
					departmentList
				}
				onCreateDepartment={
					handleCreateDepartment
				}
				type={
					type
				}
				onTypeChange={
					setType
				}
				employmentTypes={
					EMPLOYMENT_TYPES
				}
				location={
					location
				}
				onLocationChange={
					setLocation
				}
				locationList={
					locationList
				}
				onCreateLocation={
					handleCreateLocation
				}
				workplace={
					workplace
				}
				onWorkplaceChange={
					setWorkplace
				}
				experience={
					experience
				}
				onExperienceChange={
					setExperience
				}
				deadline={
					deadline
				}
				onDeadlineChange={
					setDeadline
				}
				isActive={
					isActive
				}
				onIsActiveChange={
					setIsActive
				}
			/>

			<AdminCareerDetailFields
				overview={
					overview
				}
				onOverviewChange={
					setOverview
				}
				responsibilitiesText={
					responsibilitiesText
				}
				onResponsibilitiesChange={
					setResponsibilitiesText
				}
				requirementsText={
					requirementsText
				}
				onRequirementsChange={
					setRequirementsText
				}
			/>
		</FormDialog>
	);
}
