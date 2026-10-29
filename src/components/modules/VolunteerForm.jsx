/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { getStoredUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import {
	sanitizeName,
	sanitizePhone,
	sanitizeEmail,
	sanitizeCity,
	sanitizeStandardText,
	stripEmojis,
	validateName,
	validatePhone,
	validateEmail,
} from "@/lib/security";

const INTEREST_OPTIONS = [
	"Tutor Bimbel PABE Smart (Akademis, Komputer & Bahasa)",
	"Pengajar TPA & Bimbingan Al-Qur'an",
	"Penyaluran Santunan & Operasional Doa Istighotsah",
	"Layanan Kesehatan & Terapi Akupresur Lansia Dhu'afa",
	"Dokumentasi, Desain & Tim Media Kreatif",
	"Aksi Kemanusiaan & Tanggap Darurat",
];

const DRAFT_STORAGE_KEY = "pabe_volunteer_draft";

export function VolunteerForm() {
	const router = useRouter();
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [city, setCity] = useState("");
	const [interest, setInterest] = useState("");
	const [motivation, setMotivation] = useState("");
	const [loading, setLoading] = useState(false);
	const [isEmailLocked, setIsEmailLocked] = useState(false);
	const [errors, setErrors] = useState({});

	// Restore draft if user refreshed the page or experienced disconnect
	useEffect(() => {
		try {
			const saved =
				sessionStorage.getItem(
					DRAFT_STORAGE_KEY,
				);
			if (
				saved
			) {
				const parsed =
					JSON.parse(
						saved,
					);
				if (
					parsed.fullName
				)
					setFullName(
						parsed.fullName,
					);
				if (
					parsed.phone
				)
					setPhone(
						parsed.phone,
					);
				if (
					parsed.email
				)
					setEmail(
						parsed.email,
					);
				if (
					parsed.city
				)
					setCity(
						parsed.city,
					);
				if (
					parsed.interest
				)
					setInterest(
						parsed.interest,
					);
				if (
					parsed.motivation
				)
					setMotivation(
						parsed.motivation,
					);
			}
		} catch {
			// ignore
		}
	}, []);

	// Auto-save draft on every change
	useEffect(() => {
		try {
			if (
				fullName ||
				phone ||
				email ||
				city ||
				motivation
			) {
				sessionStorage.setItem(
					DRAFT_STORAGE_KEY,
					JSON.stringify(
						{
							fullName,
							phone,
							email,
							city,
							interest,
							motivation,
						},
					),
				);
			}
		} catch {
			// ignore
		}
	}, [
		fullName,
		phone,
		email,
		city,
		interest,
		motivation,
	]);

	useEffect(() => {
		const user =
			getStoredUser();
		if (!user) return;

		queueMicrotask(() => {
			if (
				user.name &&
				user.name !==
					"Pengguna Google" &&
				user.name !==
					"Pengguna Facebook"
			) {
				setFullName(
					(
						prev,
					) =>
						prev ||
						user.name,
				);
			}
			if (
				user.phone &&
				user.phone !==
					"-"
			) {
				const cleanPhone =
					sanitizePhone(
						user.phone,
					);
				if (
					cleanPhone
				) {
					setPhone(
						(
							prev,
						) =>
							prev ||
							cleanPhone,
					);
				}
			}
			if (
				user.email &&
				!user.email.endsWith(
					"@google.user",
				) &&
				!user.email.endsWith(
					"@facebook.user",
				)
			) {
				setEmail(user.email);
				setIsEmailLocked(true);
			}
		});
	}, []);

	const isFormValid = useMemo(() => {
		const nameOk = validateName(fullName).isValid;
		const phoneOk = validatePhone(phone).isValid;
		const emailOk = validateEmail(email, true).isValid;
		const cleanCity = stripEmojis(city)
			.replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "")
			.trim();
		const cityOk = cleanCity.length >= 2;
		const interestOk = Boolean(interest);
		return Boolean(nameOk && phoneOk && emailOk && cityOk && interestOk);
	}, [fullName, phone, email, city, interest]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newErrors = {};
		const nameVal = validateName(fullName);
		if (!nameVal.isValid) {
			newErrors.fullName = nameVal.message;
		}

		const phoneVal = validatePhone(phone);
		if (!phoneVal.isValid) {
			newErrors.phone = phoneVal.message;
		}

		const emailVal = validateEmail(email, true);
		if (!emailVal.isValid) {
			newErrors.email = emailVal.message || "Email wajib diisi dengan format yang benar.";
		}

		const cleanCity = stripEmojis(city)
			.replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "")
			.trim();
		if (!cleanCity || cleanCity.length < 2) {
			newErrors.city = "Mohon masukkan kota / kabupaten domisili yang valid.";
		}

		if (!interest) {
			newErrors.interest = "Mohon pilih peminatan aksi relawan.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const firstError = Object.values(newErrors)[0];
			toast.error(firstError);
			return;
		}
		setErrors({});

		try {
			setLoading(
				true,
			);
			const res =
				await safeFetch(
					"/api/volunteers",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(
							{
								fullName: nameVal.sanitized,
								phone: phoneVal.sanitized,
								email: email
									? validateEmail(
											email,
										)
											.sanitized
									: "",
								city: cleanCity,
								interest,
								motivation: stripEmojis(
									motivation,
								).slice(
									0,
									500,
								),
							},
						),
					},
				);

			const json =
				await res.json();
			if (
				!res.ok ||
				!json.success
			) {
				throw new Error(
					json.message ||
						"Gagal mengirim pendaftaran.",
				);
			}

			sessionStorage.removeItem(
				DRAFT_STORAGE_KEY,
			);
			toast.success(
				json.message ||
					"Pendaftaran relawan berhasil dikirim!",
			);

			const user =
				getStoredUser();
			if (
				user
			) {
				router.push(
					"/donatur/relawan",
				);
			} else {
				router.push(
					"/login?redirect=/donatur/relawan",
				);
			}
		} catch (err) {
			toast.error(
				err.message ||
					"Gagal mengirim pendaftaran relawan.",
			);
		} finally {
			setLoading(
				false,
			);
		}
	};

	return (
		<form
			onSubmit={
				handleSubmit
			}
			className="bg-white p-6 sm:p-8 rounded-xl border border-border-subtle space-y-4 shadow-sm"
		>
			<FormField
				label="Nama lengkap"
				required
				error={errors.fullName}
			>
				<Input
					type="text"
					required
					value={fullName}
					maxLength={60}
					onChange={(e) => {
						setFullName(sanitizeName(e.target.value));
						if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
					}}
					onBlur={() => setFullName((prev) => prev.trim())}
					placeholder="Nama Anda"
					className="h-11 font-normal"
				/>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField
					label="Nomor WhatsApp"
					required
					error={errors.phone}
				>
					<Input
						type="tel"
						inputMode="tel"
						required
						value={phone}
						maxLength={15}
						onChange={(e) => {
							setPhone(sanitizePhone(e.target.value));
							if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
						}}
						onBlur={() => setPhone((prev) => prev.trim())}
						placeholder="0812xxxxxxxx"
						className="h-11 font-normal"
					/>
				</FormField>

				<FormField
					label="Alamat email"
					required
					error={errors.email}
					hint={isEmailLocked ? "Email terkunci sesuai akun login Anda." : undefined}
				>
					<Input
						type="email"
						inputMode="email"
						spellCheck={false}
						required
						readOnly={isEmailLocked}
						value={email}
						maxLength={100}
						onChange={(e) => {
							if (!isEmailLocked) {
								setEmail(sanitizeEmail(e.target.value));
								if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
							}
						}}
						onBlur={() => setEmail((prev) => prev.trim())}
						placeholder="email@anda.com"
						className={cn(
							"h-11 font-normal",
							isEmailLocked &&
								"bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
						)}
					/>
				</FormField>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField
					label="Kota / kabupaten domisili"
					required
					error={errors.city}
				>
					<Input
						type="text"
						required
						value={city}
						maxLength={50}
						onChange={(e) => {
							setCity(sanitizeCity(e.target.value));
							if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
						}}
						onBlur={() => setCity((prev) => prev.trim())}
						placeholder="Contoh: Jakarta Timur / Bekasi"
						className="h-11 font-normal"
					/>
				</FormField>

				<FormField
					label="Peminatan aksi"
					required
					error={errors.interest}
				>
					<Select
						value={interest}
						onValueChange={(val) => {
							setInterest(val);
							if (errors.interest) setErrors((prev) => ({ ...prev, interest: undefined }));
						}}
					>
						<SelectTrigger className="w-full h-11 text-sm rounded-lg bg-white">
							<SelectValue placeholder="Pilih peminatan aksi..." />
						</SelectTrigger>
						<SelectContent>
							{INTEREST_OPTIONS.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField
				label="Motivasi & pengalaman singkat"
				error={errors.motivation}
			>
				<Textarea
					rows={3}
					value={motivation}
					maxLength={500}
					onChange={(e) => {
						setMotivation(sanitizeStandardText(e.target.value, 500));
						if (errors.motivation) setErrors((prev) => ({ ...prev, motivation: undefined }));
					}}
					onBlur={() => setMotivation((prev) => prev.trim())}
					placeholder="Ceritakan keahlian atau alasan Anda ingin bergabung..."
					className="resize-none"
				/>
			</FormField>

			<Button
				type="submit"
				isLoading={loading}
				disabled={loading || !isFormValid}
				className="w-full h-11 font-medium"
			>
				{loading
					? "Mengirim pendaftaran..."
					: "Daftar sebagai relawan"}
			</Button>
		</form>
	);
}
