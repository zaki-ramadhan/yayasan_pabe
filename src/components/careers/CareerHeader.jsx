import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * CareerHeader: Full-width hero banner with texture overlay and high-contrast typography
 * @param {string} title
 * @param {string} [description]
 * @param {React.ReactNode} [badge]
 * @param {string} [className]
 */
export function CareerHeader({
	title = "Peluang Karier ",
	description,
	badge,
	className = "",
}) {
	return (
		<header
			className={cn(
				"relative w-full overflow-hidden bg-slate-950 pt-10 sm:pt-14 pb-8 sm:pb-10 border-b border-slate-800",
				className,
			)}
		>
			{/* Background Image Texture */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<Image
					src="/img/texture_overlay_4.jpeg"
					alt="Latar Belakang Karier Yayasan PABE"
					fill
					priority
					sizes="100vw"
					className="object-cover object-center"
				/>
				{/* Subtle Dark Overlays for Optimal Text Readability & Contrast */}
				<div className="absolute inset-0 bg-slate-950/40" />
				<div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90" />
			</div>

			{/* Inner Content bounded to standard body width to prevent ultra-wide stretching */}
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto text-center space-y-3">
					{badge && (
						<div className="mb-2 flex justify-center">
							{
								badge
							}
						</div>
					)}
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
						{
							title
						}
					</h1>
					{description && (
						<p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
							{
								description
							}
						</p>
					)}
				</div>
			</div>
		</header>
	);
}
