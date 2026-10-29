"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight, Check } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import {
	PROGRAM_MENU,
	INFORMASI_MENU,
	isNavItemActive,
	isParentMenuActive,
} from "@/data/navigation";
import { cn } from "@/lib/utils";

export function NavDesktopMenu({ pathname }) {
	const [isProgramOpen, setIsProgramOpen] = useState(false);
	const [isInformasiOpen, setIsInformasiOpen] = useState(false);

	const isProgramActive = isParentMenuActive(PROGRAM_MENU, pathname);
	const isGaleriActive = isNavItemActive("/galeri", pathname);
	const isArtikelActive = isNavItemActive("/artikel", pathname);
	const isInformasiActive = isParentMenuActive(INFORMASI_MENU, pathname);

	// Otomatis tutup menu saat route berubah
	const [prevPathname, setPrevPathname] = useState(pathname);
	if (prevPathname !== pathname) {
		setPrevPathname(pathname);
		setIsProgramOpen(false);
		setIsInformasiOpen(false);
	}

	return (
		<nav className="hidden lg:flex items-stretch h-full gap-1 xl:gap-2">
			{/* 1. Home */}
			<Link
				href="/"
				className={cn(
					"inline-flex items-center px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full",
					isNavItemActive("/", pathname)
						? "text-primary border-primary -mb-px"
						: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
				)}
			>
				Beranda
			</Link>

			{/* 2. Tentang Kami */}
			<Link
				href="/tentang-kami"
				className={cn(
					"inline-flex items-center px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full",
					isNavItemActive("/tentang-kami", pathname)
						? "text-primary border-primary -mb-px"
						: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
				)}
			>
				Tentang Kami
			</Link>

			{/* 3. Program Dropdown (Click to toggle) */}
			<DropdownMenu open={isProgramOpen} onOpenChange={setIsProgramOpen}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							"group inline-flex items-center gap-1.5 px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full select-none outline-none [&[data-state=open]>svg]:rotate-180",
							isProgramActive || isProgramOpen
								? "text-primary border-primary -mb-px"
								: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
						)}
					>
						<span>Program</span>
						<ChevronDown
							className={cn(
								"w-4 h-4 opacity-70 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
								isProgramOpen && "rotate-180"
							)}
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-60 p-1.5 shadow-md bg-white border border-slate-200 rounded-lg"
				>
					{PROGRAM_MENU.map((item) => {
						const isActive = isNavItemActive(item.href, pathname);
						return (
							<DropdownMenuItem
								key={item.label}
								asChild
								onSelect={() => setIsProgramOpen(false)}
							>
								<Link
									href={item.href}
									className={cn(
										"group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
										isActive
											? "bg-primary text-white shadow-xs select-none pointer-events-none"
											: "text-slate-800 hover:bg-slate-100 hover:text-slate-950 cursor-pointer",
									)}
								>
									<span>{item.label}</span>
									{isActive ? (
										<Check className="w-4 h-4 text-white shrink-0" strokeWidth={2.5} />
									) : (
										<ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" strokeWidth={2.5} />
									)}
								</Link>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* 4. Galeri (Direct Link) */}
			<Link
				href="/galeri"
				className={cn(
					"inline-flex items-center px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full",
					isGaleriActive
						? "text-primary border-primary -mb-px"
						: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
				)}
			>
				Galeri
			</Link>

			{/* 5. Artikel (Direct Link) */}
			<Link
				href="/artikel"
				className={cn(
					"inline-flex items-center px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full",
					isArtikelActive
						? "text-primary border-primary -mb-px"
						: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
				)}
			>
				Artikel
			</Link>

			{/* 6. Informasi Dropdown (Click to toggle) */}
			<DropdownMenu open={isInformasiOpen} onOpenChange={setIsInformasiOpen}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							"group inline-flex items-center gap-1.5 px-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer h-full select-none outline-none [&[data-state=open]>svg]:rotate-180",
							isInformasiActive || isInformasiOpen
								? "text-primary border-primary -mb-px"
								: "text-slate-700 hover:text-slate-950 border-transparent hover:border-slate-300 -mb-px",
						)}
					>
						<span>Informasi</span>
						<ChevronDown
							className={cn(
								"w-4 h-4 opacity-70 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
								isInformasiOpen && "rotate-180"
							)}
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-64 p-1.5 shadow-md bg-white border border-slate-200 rounded-lg"
				>
					{INFORMASI_MENU.map((item) => {
						const isActive = isNavItemActive(item.href, pathname);
						return (
							<DropdownMenuItem
								key={item.label}
								asChild
								onSelect={() => setIsInformasiOpen(false)}
							>
								<Link
									href={item.href}
									className={cn(
										"group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
										isActive
											? "bg-primary text-white shadow-xs select-none pointer-events-none"
											: "text-slate-800 hover:bg-slate-100 hover:text-slate-950 cursor-pointer",
									)}
								>
									<span>{item.label}</span>
									{isActive ? (
										<Check className="w-4 h-4 text-white shrink-0" strokeWidth={2.5} />
									) : (
										<ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" strokeWidth={2.5} />
									)}
								</Link>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}
