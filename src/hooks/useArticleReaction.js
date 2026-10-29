"use client";

import { useState, useMemo, useSyncExternalStore, useId, useRef, useEffect, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export const LIKE_STORAGE_KEY = "pabe_liked_articles";
export const DISLIKE_STORAGE_KEY = "pabe_disliked_articles";
export const REACTION_SYNC_EVENT = "pabe_article_reaction_sync";

function subscribeReactions(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(REACTION_SYNC_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(REACTION_SYNC_EVENT, callback);
  };
}

function getLikesSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(LIKE_STORAGE_KEY) || "[]";
}

function getDislikesSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

/**
 * Hook kustom untuk mengelola interaksi Like & Dislike artikel secara reaktif,
 * tersinkronisasi lintas komponen & tab browser melalui Web Storage API.
 */
export function useArticleReaction({
  slug,
  articleId,
  initialLikes = 0,
  initialDislikes = 0,
}) {
  const instanceId = useId();
  const [likes, setLikes] = useState(initialLikes);
  const [prevInitialLikes, setPrevInitialLikes] = useState(initialLikes);
  if (prevInitialLikes !== initialLikes) {
    setPrevInitialLikes(initialLikes);
    setLikes(initialLikes);
  }

  const [dislikes, setDislikes] = useState(initialDislikes);
  const [prevInitialDislikes, setPrevInitialDislikes] = useState(initialDislikes);
  if (prevInitialDislikes !== initialDislikes) {
    setPrevInitialDislikes(initialDislikes);
    setDislikes(initialDislikes);
  }

  const targetSlug = slug || articleId;
  const reactionDebounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (reactionDebounceRef.current) {
        clearTimeout(reactionDebounceRef.current);
      }
    };
  }, []);

  const storedLikesRaw = useSyncExternalStore(subscribeReactions, getLikesSnapshot, getServerSnapshot);
  const storedDislikesRaw = useSyncExternalStore(subscribeReactions, getDislikesSnapshot, getServerSnapshot);

  const hasLiked = useMemo(() => {
    try {
      const arr = JSON.parse(storedLikesRaw);
      return Array.isArray(arr) && (
        (articleId && arr.includes(articleId)) ||
        (targetSlug && arr.includes(targetSlug))
      );
    } catch {
      return false;
    }
  }, [storedLikesRaw, articleId, targetSlug]);

  const hasDisliked = useMemo(() => {
    try {
      const arr = JSON.parse(storedDislikesRaw);
      return Array.isArray(arr) && (
        (articleId && arr.includes(articleId)) ||
        (targetSlug && arr.includes(targetSlug))
      );
    } catch {
      return false;
    }
  }, [storedDislikesRaw, articleId, targetSlug]);

  // Tangani event sinkronisasi antar komponen di halaman yang sama
  useEffect(() => {
    const handleSync = (e) => {
      const detail = e.detail;
      if (!detail || detail.sourceId === instanceId) return;
      const matches =
        (targetSlug && (detail.articleId === targetSlug || detail.alternateId === targetSlug)) ||
        (articleId && (detail.articleId === articleId || detail.alternateId === articleId));

      if (matches) {
        if (typeof detail.likeDelta === "number") {
          setLikes((prev) => Math.max(0, prev + detail.likeDelta));
        }
        if (typeof detail.dislikeDelta === "number") {
          setDislikes((prev) => Math.max(0, prev + detail.dislikeDelta));
        }
      }
    };

    window.addEventListener(REACTION_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(REACTION_SYNC_EVENT, handleSync);
  }, [instanceId, targetSlug, articleId]);

  const scheduleServerReaction = useCallback((targetArticleSlug, type) => {
    if (reactionDebounceRef.current) {
      clearTimeout(reactionDebounceRef.current);
    }
    reactionDebounceRef.current = setTimeout(async () => {
      try {
        const res = await safeFetch("/api/articles/reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: targetArticleSlug, type }),
        });
        if (!res.ok) {
          toast({
            variant: "destructive",
            title: "Gagal Menyimpan Reaksi",
            description: "Koneksi terputus. Reaksi Anda belum tersimpan di server.",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan Reaksi",
          description: "Koneksi internet bermasalah. Reaksi belum tersimpan.",
        });
      }
    }, 400);
  }, []);

  const handleToggleLike = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const storedLikes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || "[]");
      const storedDislikes = JSON.parse(localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]");

      const nextLiked = !hasLiked;
      const identifiersToRemove = [targetSlug, articleId].filter(Boolean);

      const updatedLikes = nextLiked
        ? Array.from(new Set([...storedLikes, targetSlug, articleId].filter(Boolean)))
        : storedLikes.filter((id) => !identifiersToRemove.includes(id));

      const updatedDislikes = hasDisliked
        ? storedDislikes.filter((id) => !identifiersToRemove.includes(id))
        : storedDislikes;

      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(updatedLikes));
      localStorage.setItem(DISLIKE_STORAGE_KEY, JSON.stringify(updatedDislikes));

      const likeDelta = nextLiked ? 1 : -1;
      const dislikeDelta = hasDisliked ? -1 : 0;

      setLikes((prev) => Math.max(0, prev + likeDelta));
      if (hasDisliked) {
        setDislikes((prev) => Math.max(0, prev - 1));
      }

      if (targetSlug) {
        if (nextLiked) {
          if (hasDisliked) {
            scheduleServerReaction(targetSlug, "undislike");
          }
          scheduleServerReaction(targetSlug, "like");
        } else {
          scheduleServerReaction(targetSlug, "unlike");
        }
      }

      window.dispatchEvent(
        new CustomEvent(REACTION_SYNC_EVENT, {
          detail: {
            sourceId: instanceId,
            articleId: targetSlug,
            alternateId: articleId,
            hasLiked: nextLiked,
            likeDelta,
            hasDisliked: false,
            dislikeDelta,
          },
        })
      );
    } catch {
      // ignore storage error
    }
  }, [hasLiked, hasDisliked, targetSlug, articleId, instanceId, scheduleServerReaction]);

  const handleToggleDislike = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const storedLikes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || "[]");
      const storedDislikes = JSON.parse(localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]");

      const nextDisliked = !hasDisliked;
      const identifiersToRemove = [targetSlug, articleId].filter(Boolean);

      const updatedDislikes = nextDisliked
        ? Array.from(new Set([...storedDislikes, targetSlug, articleId].filter(Boolean)))
        : storedDislikes.filter((id) => !identifiersToRemove.includes(id));

      const updatedLikes = hasLiked
        ? storedLikes.filter((id) => !identifiersToRemove.includes(id))
        : storedLikes;

      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(updatedLikes));
      localStorage.setItem(DISLIKE_STORAGE_KEY, JSON.stringify(updatedDislikes));

      const dislikeDelta = nextDisliked ? 1 : -1;
      const likeDelta = hasLiked ? -1 : 0;

      setDislikes((prev) => Math.max(0, prev + dislikeDelta));
      if (hasLiked) {
        setLikes((prev) => Math.max(0, prev - 1));
      }

      if (targetSlug) {
        if (nextDisliked) {
          if (hasLiked) {
            scheduleServerReaction(targetSlug, "unlike");
          }
          scheduleServerReaction(targetSlug, "dislike");
        } else {
          scheduleServerReaction(targetSlug, "undislike");
        }
      }

      window.dispatchEvent(
        new CustomEvent(REACTION_SYNC_EVENT, {
          detail: {
            sourceId: instanceId,
            articleId: targetSlug,
            alternateId: articleId,
            hasDisliked: nextDisliked,
            dislikeDelta,
            hasLiked: false,
            likeDelta,
          },
        })
      );
    } catch {
      // ignore storage error
    }
  }, [hasDisliked, hasLiked, targetSlug, articleId, instanceId, scheduleServerReaction]);

  return {
    likes,
    dislikes,
    hasLiked,
    hasDisliked,
    handleToggleLike,
    handleToggleDislike,
  };
}
