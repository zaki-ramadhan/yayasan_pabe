import { SafeImage } from "@/components/ui/SafeImage";

/**
 * 3 Postingan Mini Preview (Flush edge-to-edge / Non-hoverable)
 * @param {Array} posts
 */
export function InstagramMiniGrid({ posts = [] }) {
  const previewPosts = posts.slice(0, 3);
  if (previewPosts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-[2px] w-full bg-slate-950 pointer-events-none select-none">
      {previewPosts.map((post, idx) => (
        <div
          key={post.id || idx}
          className="relative aspect-square w-full bg-slate-800"
        >
          <SafeImage
            src={post.imageUrl}
            alt={post.alt || "Preview post"}
            fill
            sizes="130px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
