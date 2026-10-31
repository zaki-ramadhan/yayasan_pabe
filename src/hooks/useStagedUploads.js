"use client";

import { useRef, useCallback, useEffect } from "react";
import { deleteFileFromServer, sendBeaconDelete } from "@/services/uploadService";

/**
 * Hook modular untuk melacak dan membersihkan berkas yang diunggah sementara (staged uploads).
 * Mencegah berkas sampah (orphaned files) di Cloudflare R2 jika pengguna membatalkan,
 * menutup modal dialog, atau menutup peramban sebelum menyimpan formulir.
 *
 * @returns {{
 *   trackUpload: (url: string) => void,
 *   commitUploads: () => void,
 *   discardUploads: () => void,
 * }}
 */
export function useStagedUploads() {
  const stagedUrlsRef = useRef(new Set());
  const isCommittedRef = useRef(false);

  const trackUpload = useCallback((url) => {
    if (url && typeof url === "string" && !url.startsWith("data:") && !url.startsWith("blob:")) {
      stagedUrlsRef.current.add(url);
    }
  }, []);

  const commitUploads = useCallback(() => {
    isCommittedRef.current = true;
    stagedUrlsRef.current.clear();
  }, []);

  const discardUploads = useCallback(() => {
    if (stagedUrlsRef.current.size > 0 && !isCommittedRef.current) {
      const urls = Array.from(stagedUrlsRef.current);
      deleteFileFromServer(urls);
      stagedUrlsRef.current.clear();
    }
  }, []);

  useEffect(() => {
    const stagedUrls = stagedUrlsRef.current;

    const handleBeforeUnload = () => {
      if (stagedUrls.size > 0 && !isCommittedRef.current) {
        sendBeaconDelete(Array.from(stagedUrls));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (stagedUrls.size > 0 && !isCommittedRef.current) {
        const urls = Array.from(stagedUrls);
        deleteFileFromServer(urls);
        stagedUrls.clear();
      }
    };
  }, []);

  return { trackUpload, commitUploads, discardUploads };
}
