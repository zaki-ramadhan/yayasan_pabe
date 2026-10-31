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

  const targetUrl = post.postUrl || fallbackUrl;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.caption ? `Postingan Instagram: ${post.caption}` : "Postingan Instagram"}
      className="group relative aspect-square w-full rounded sm:rounded-xl overflow-hidden bg-slate-100 select-none block"
    >
      <SafeImage
        src={post.imageUrl}
        alt={post.alt || post.caption || "Postingan Instagram"}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out flex flex-col justify-end p-3 sm:p-4 pointer-events-none"
        aria-hidden="true"
      >
        {post.caption ? (
          <p className="text-white text-sm font-medium line-clamp-2 leading-snug drop-shadow-sm transform translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300 ease-out">
            {post.caption}
          </p>
        ) : null}
      </div>
    </a>
  );
}
