export type RecordingStatus =
  | "idle"
  | "selecting"
  | "recording"
  | "stopped"
  | "error";

export type StatusVariant = "" | "ok" | "error";

export type QualityPresetId = "1080p30" | "1080p60" | "1440p60" | "max";

export interface MimeTypeOption {
  label: string;
  value: string;
}

export interface QualityPreset {
  id: QualityPresetId;
  label: string;
  summary: string;
  videoConstraints: MediaTrackConstraints;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

export interface CaptureInfo {
  width: number;
  height: number;
  frameRate: number;
  mimeLabel: string;
  videoMbps: number;
}

export interface Recording {
  id: string;
  url: string;
  name: string;
  duration: number;
  size: number;
}
