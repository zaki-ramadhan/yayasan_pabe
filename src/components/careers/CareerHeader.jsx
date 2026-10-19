import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";

/**
 * CareerHeader: Proxy component delegating to the reusable InformationHeroHeader
 */
export function CareerHeader({
	title = "Peluang Karier",
	description,
	badge,
	className = "",
}) {
	return (
		<InformationHeroHeader
			title={title}
			description={description}
			badge={badge}
			className={className}
			imageAlt="Latar Belakang Karier Yayasan PABE"
		/>
	);
}
