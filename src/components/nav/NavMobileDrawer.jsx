"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	ChevronDown,
	LayoutDashboard,
	ArrowUpRight,
	User,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	PROGRAM_MENU,
	INFORMASI_MENU,
	isNavItemActive,
	isParentMenuActive,
} from "@/data/navigation";
import { getRedirectPathForRole } from "@/services/authService";
import { cn } from "@/lib/utils";

export function NavMobileDrawer({ pathname, currentUser, onClose, onLogout }) {
	const isHomeActive = isNavItemActive("/", pathname);
	const isTentangKamiActive = isNavItemActive(
		"/tentang-kami",
		pathname,
	);
	const isProgramActive = isParentMenuActive(
		PROGRAM_MENU,
		pathname,
	);
	const isArtikelActive = isNavItemActive(
		"/artikel",
		pathname,
	);
	const isInformasiActive = isParentMenuActive(
		INFORMASI_MENU,
		pathname,
	);

	const [activeAccordion, setActiveAccordion] =
		useState(() => {
			if (
				isProgramActive
			)
				return "program";
			if (
				isInformasiActive
			)
				return "informasi";
			return null;
		});

	const toggleAccordion = (name) => {
		setActiveAccordion(
			activeAccordion ===
				name
				? null
				: name,
		);
	};

	return (
		<div className="lg:hidden border-b border-slate-300 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
			<div className="space-y-1">
				{/* Home */}
				<Link
					href="/"
					onClick={
						onClose
					}
					className={cn(
						"block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
						isHomeActive
							? "bg-slate-100 text-primary"
							: "text-slate-800 hover:bg-slate-50",
					)}
				>
					Beranda
				</Link>

				{/* Tentang Kami */}
				<Link
					href="/tentang-kami"
					onClick={
						onClose
					}
					className={cn(
						"block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
						isTentangKamiActive
							? "bg-slate-100 text-primary"
							: "text-slate-800 hover:bg-slate-50",
					)}
				>
					Tentang
					Kami
				</Link>

				{/* Program Accordion */}
				<div>
					<button
						type="button"
						onClick={() =>
							toggleAccordion(
								"program",
							)
						}
						className={cn(
							"flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors",
							isProgramActive
								? "bg-slate-100 text-primary"
								: "text-slate-800 hover:bg-slate-50",
						)}
					>
						<span>
							Program
						</span>
						<ChevronDown
							className={cn(
								"w-4 h-4 transition-transform",
								isProgramActive
									? "text-primary"
									: "text-slate-500",
								activeAccordion ===
									"program" &&
									"rotate-180",
							)}
						/>
					</button>
					{activeAccordion ===
						"program" && (
						<div className="pl-3 pr-2 py-1 space-y-1 bg-slate-50 rounded-lg mt-1 border-l-2 border-primary">
							{PROGRAM_MENU.map(
								(
									item,
								) => {
									const isItemActive =
										isNavItemActive(
											item.href,
											pathname,
										);
									return (
										<Link
											key={
												item.label
											}
											href={
												item.href
											}
											onClick={
												onClose
											}
											className={cn(
												"flex items-center justify-between py-2 px-2.5 text-sm font-medium rounded-md transition-colors",
												isItemActive
													? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xs hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:text-white cursor-default select-none pointer-events-none"
													: "text-slate-700 hover:text-slate-950 hover:bg-slate-100",
											)}
										>
											<span>
												{
													item.label
												}
											</span>
											{isItemActive ? (
												<Check
													className="w-3.5 h-3.5 text-white shrink-0"
													strokeWidth={
														2.5
													}
												/>
											) : (
												<ArrowUpRight
													className="w-3.5 h-3.5 text-slate-400"
													strokeWidth={
														2.5
													}
												/>
											)}
										</Link>
									);
								},
							)}
						</div>
					)}
				</div>

				{/* Artikel (Direct Link) */}
				<Link
					href="/artikel"
					onClick={
						onClose
					}
					className={cn(
						"block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
						isArtikelActive
							? "bg-slate-100 text-primary"
							: "text-slate-800 hover:bg-slate-50",
					)}
				>
					Artikel
				</Link>

				{/* Informasi Accordion */}
				<div>
					<button
						type="button"
						onClick={() =>
							toggleAccordion(
								"informasi",
							)
						}
						className={cn(
							"flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors",
							isInformasiActive
								? "bg-slate-100 text-primary"
								: "text-slate-800 hover:bg-slate-50",
						)}
					>
						<span>
							Informasi
						</span>
						<ChevronDown
							className={cn(
								"w-4 h-4 transition-transform",
								isInformasiActive
									? "text-primary"
									: "text-slate-500",
								activeAccordion ===
									"informasi" &&
									"rotate-180",
							)}
						/>
					</button>
					{activeAccordion ===
						"informasi" && (
						<div className="pl-3 pr-2 py-1 space-y-1 bg-slate-50 rounded-lg mt-1 border-l-2 border-primary">
							{INFORMASI_MENU.map(
								(
									item,
								) => {
									const isItemActive =
										isNavItemActive(
											item.href,
											pathname,
										);
									return (
										<Link
											key={
												item.label
											}
											href={
												item.href
											}
											onClick={
												onClose
											}
											className={cn(
												"flex items-center justify-between py-2 px-2.5 text-sm font-medium rounded-md transition-colors",
												isItemActive
													? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xs hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:text-white cursor-default select-none pointer-events-none"
													: "text-slate-700 hover:text-slate-950 hover:bg-slate-100",
											)}
										>
											<span>
												{
													item.label
												}
											</span>
											{isItemActive ? (
												<Check
													className="w-3.5 h-3.5 text-white shrink-0"
													strokeWidth={
														2.5
													}
												/>
											) : (
												<ArrowUpRight
													className="w-3.5 h-3.5 text-slate-400"
													strokeWidth={
														2.5
													}
												/>
											)}
										</Link>
									);
								},
							)}
						</div>
					)}
				</div>
			</div>

			{/* Mobile Auth Button */}
			<div className="pt-3 border-t border-slate-200">
				{currentUser ? (
					<div className="space-y-3">
						<div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
							<div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center">
								{currentUser.avatar ? (
									<Image
										src={currentUser.avatar}
										alt={currentUser.name || "User Avatar"}
										width={40}
										height={40}
										unoptimized
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="font-medium text-sm text-white">
										{currentUser.initials ||
											"U"}
									</span>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<span
									className="block text-sm font-medium text-slate-900 truncate"
									title={
										currentUser.name
									}
								>
									{
										currentUser.name
									}
								</span>
								<span className="block text-xs text-slate-500 truncate font-mono">
									{currentUser.email ||
										"Donatur Terdaftar"}
								</span>
							</div>
						</div>

						{currentUser.role !==
							"DONOR" && (
							<Link
								href="/dashboard"
								onClick={
									onClose
								}
								className="flex items-center justify-center gap-2 w-full h-10 rounded-lg font-medium bg-slate-900 text-white text-sm"
							>
								<LayoutDashboard className="w-4 h-4" />
								<span>
									Portal
									Dashboard
									Yayasan
								</span>
							</Link>
						)}

						<button
							type="button"
							onClick={() => {
								onLogout();
								onClose();
							}}
							className="w-full h-10 rounded-lg font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
						>
							<span>
								Keluar
								(Logout)
							</span>
						</button>
					</div>
				) : (
					<Link
						href="/login"
						onClick={
							onClose
						}
						className="w-full block"
					>
						<Button className="w-full h-10 rounded-lg font-medium bg-slate-900 hover:bg-slate-800 text-white justify-center text-sm shadow-2xs cursor-pointer flex items-center gap-2">
							<User className="w-4 h-4 text-white" />
							<span>
								Masuk
								/
								Login
								Akun
							</span>
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
