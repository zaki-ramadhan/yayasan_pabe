import { Heart, MessageCircle } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCompactNumber } from "@/lib/formatters";

/**
 * Single Instagram feed photo card with hover overlay
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
    >
      <SafeImage
        src={post.imageUrl}
        alt={post.alt || post.caption || "Postingan Instagram"}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3.5 sm:gap-5 p-2 text-white pointer-events-none z-20 transition-opacity">
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
          {formatCompactNumber(post.likes)}
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
          {formatCompactNumber(post.comments)}
        </span>
      </div>
    </a>
  );
}
