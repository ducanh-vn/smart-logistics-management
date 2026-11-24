"use client";
import { useState } from "react";
import { PHOTO_MAX_SIZE } from "@/constants/delivery";

/** Reads a camera photo and shrinks it to a JPEG data URL (keeps uploads small on 4G). */
export function usePhotoCapture() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/jpeg", 0.7));
    } finally {
      setBusy(false);
    }
  };
  return { photo, busy, onFile, clear: () => setPhoto(null) };
}
