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
 * tersinkronisasi lintas komponen & tab browser melalui Web Storage API,
 * dengan transisi mutasi atomik server-side (anti-drift).
 */
export function useArticleReaction({
  slug,
  articleId,
  initialLikes = 0,
  initialDislikes = 0,
}) {
  const instanceId = useId();
  const targetSlug = slug || articleId;

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

  const committedStateRef = useRef(null);
  if (committedStateRef.current === null) {
    committedStateRef.current = hasLiked ? "like" : (hasDisliked ? "dislike" : "none");
  }

  const pendingActionRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!pendingActionRef.current) {
      committedStateRef.current = hasLiked ? "like" : (hasDisliked ? "dislike" : "none");
    }
  }, [hasLiked, hasDisliked]);

  // Tangani event sinkronisasi antar komponen di halaman yang sama
  useEffect(() => {
    const handleSync = (e) => {
      const detail = e.detail;
      if (!detail || detail.sourceId === instanceId) return;
      const matches =
        (targetSlug && (detail.articleId === targetSlug || detail.alternateId === targetSlug)) ||
        (articleId && (detail.articleId === articleId || detail.alternateId === articleId));

      if (matches) {
        if (typeof detail.likes === "number") {
          setLikes(detail.likes);
        } else if (typeof detail.likeDelta === "number") {
          setLikes((prev) => Math.max(0, prev + detail.likeDelta));
        }

        if (typeof detail.dislikes === "number") {
          setDislikes(detail.dislikes);
        } else if (typeof detail.dislikeDelta === "number") {
          setDislikes((prev) => Math.max(0, prev + detail.dislikeDelta));
        }
      }
    };

    window.addEventListener(REACTION_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(REACTION_SYNC_EVENT, handleSync);
  }, [instanceId, targetSlug, articleId]);

  const executeServerReaction = useCallback(async (transitionType, targetState) => {
    if (!targetSlug || !transitionType) return;
    try {
      committedStateRef.current = targetState;
      const res = await safeFetch("/api/articles/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: targetSlug, type: transitionType }),
        keepalive: true,
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          if (typeof json.data.likeCount === "number") {
            setLikes(json.data.likeCount);
          }
          if (typeof json.data.dislikeCount === "number") {
            setDislikes(json.data.dislikeCount);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan Reaksi",
          description: "Reaksi Anda belum tersimpan di server.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Reaksi",
        description: "Koneksi internet bermasalah. Reaksi belum tersimpan.",
      });
    }
  }, [targetSlug]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (pendingActionRef.current) {
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        executeServerReaction(action.transitionType, action.targetState);
      }
    };
  }, [executeServerReaction]);

  const scheduleTransition = useCallback((targetState) => {
    const fromState = committedStateRef.current;
    if (fromState === targetState) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      pendingActionRef.current = null;
      return;
    }

    let transitionType = null;
    if (fromState === "none" && targetState === "like") transitionType = "like";
    else if (fromState === "like" && targetState === "none") transitionType = "unlike";
    else if (fromState === "none" && targetState === "dislike") transitionType = "dislike";
    else if (fromState === "dislike" && targetState === "none") transitionType = "undislike";
    else if (fromState === "like" && targetState === "dislike") transitionType = "like_to_dislike";
    else if (fromState === "dislike" && targetState === "like") transitionType = "dislike_to_like";

    if (!transitionType) return;

    pendingActionRef.current = { transitionType, targetState };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      debounceTimerRef.current = null;
      if (action) {
        executeServerReaction(action.transitionType, action.targetState);
      }
    }, 250);
  }, [executeServerReaction]);

  const handleToggleLike = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const storedLikes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || "[]");
      const storedDislikes = JSON.parse(localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]");

      const nextLiked = !hasLiked;
      const targetState = nextLiked ? "like" : "none";
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

      const nextLikesCount = Math.max(0, likes + likeDelta);
      const nextDislikesCount = Math.max(0, dislikes + dislikeDelta);

      setLikes(nextLikesCount);
      setDislikes(nextDislikesCount);

      scheduleTransition(targetState);

      window.dispatchEvent(
        new CustomEvent(REACTION_SYNC_EVENT, {
          detail: {
            sourceId: instanceId,
            articleId: targetSlug,
            alternateId: articleId,
            hasLiked: nextLiked,
            hasDisliked: false,
            likeDelta,
            dislikeDelta,
            likes: nextLikesCount,
            dislikes: nextDislikesCount,
          },
        })
      );
    } catch {
      // ignore storage error
    }
  }, [hasLiked, hasDisliked, targetSlug, articleId, instanceId, likes, dislikes, scheduleTransition]);

  const handleToggleDislike = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const storedLikes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY) || "[]");
      const storedDislikes = JSON.parse(localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]");

      const nextDisliked = !hasDisliked;
      const targetState = nextDisliked ? "dislike" : "none";
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

      const nextLikesCount = Math.max(0, likes + likeDelta);
      const nextDislikesCount = Math.max(0, dislikes + dislikeDelta);

      setLikes(nextLikesCount);
      setDislikes(nextDislikesCount);

      scheduleTransition(targetState);

      window.dispatchEvent(
        new CustomEvent(REACTION_SYNC_EVENT, {
          detail: {
            sourceId: instanceId,
            articleId: targetSlug,
            alternateId: articleId,
            hasDisliked: nextDisliked,
            hasLiked: false,
            dislikeDelta,
            likeDelta,
            likes: nextLikesCount,
            dislikes: nextDislikesCount,
          },
        })
      );
    } catch {
      // ignore storage error
    }
  }, [hasDisliked, hasLiked, targetSlug, articleId, instanceId, likes, dislikes, scheduleTransition]);

  return {
    likes,
    dislikes,
    hasLiked,
    hasDisliked,
    handleToggleLike,
    handleToggleDislike,
  };
}
