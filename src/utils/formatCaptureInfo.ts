import type { CaptureInfo, MimeTypeOption } from "../types/recording";

export function getMimeLabel(
  mimeType: string,
  supportedMimeTypes: MimeTypeOption[],
): string {
  const match = supportedMimeTypes.find((t) => t.value === mimeType);
  if (match) return match.label;
  if (!mimeType) return "Por defecto";
  if (mimeType.includes("vp9")) return "WebM (VP9)";
  if (mimeType.includes("vp8")) return "WebM (VP8)";
  if (mimeType.includes("mp4")) return "MP4";
  return "Video";
}

export function formatCaptureInfo(info: CaptureInfo): string {
  const fps =
    info.frameRate % 1 === 0
      ? info.frameRate.toFixed(0)
      : info.frameRate.toFixed(1);
  return `Grabando: ${info.width}×${info.height} @ ${fps} fps · ${info.mimeLabel} · ${info.videoMbps} Mbps`;
}

export function readCaptureInfo(
  videoTrack: MediaStreamTrack,
  mimeType: string,
  supportedMimeTypes: MimeTypeOption[],
  videoBitsPerSecond: number,
): CaptureInfo {
  const settings = videoTrack.getSettings();
  return {
    width: settings.width ?? 0,
    height: settings.height ?? 0,
    frameRate: settings.frameRate ?? 0,
    mimeLabel: getMimeLabel(mimeType, supportedMimeTypes),
    videoMbps: Math.round(videoBitsPerSecond / 1_000_000),
  };
}
