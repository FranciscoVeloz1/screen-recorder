import type { MimeTypeOption } from "../types/recording";

const CANDIDATE_TYPES: MimeTypeOption[] = [
  { label: "WebM (VP9)", value: "video/webm;codecs=vp9" },
  { label: "WebM (VP8)", value: "video/webm;codecs=vp8" },
  { label: "MP4", value: "video/mp4" },
];

export function getSupportedMimeTypes(): MimeTypeOption[] {
  const supported = CANDIDATE_TYPES.filter((type) =>
    MediaRecorder.isTypeSupported(type.value),
  );

  if (supported.length > 0) return supported;

  return [{ label: "Formato por defecto", value: "" }];
}
