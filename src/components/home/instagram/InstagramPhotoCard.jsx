import { SafeImage } from "@/components/ui/SafeImage";

/**
 * Single Instagram feed photo card
 *
 * @param {object} props
 * @param {object} props.post - Instagram post item
 * @param {string} [props.fallbackUrl] - Fallback URL if post doesn't have postUrl
 */
export function InstagramPhotoCard({ post, fallbackUrl }) {
  if (!post) return null;

  return (
    <a
      href={post.postUrl || fallbackUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square w-full rounded sm:rounded-xl overflow-hidden bg-slate-100 select-none block"
      title={post.caption || "Buka postingan di Instagram"}
    >
      <SafeImage
        src={post.imageUrl}
        alt={post.alt || post.caption || "Postingan Instagram"}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </a>
  );
}
