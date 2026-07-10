export type RecordingStatus =
  | "idle"
  | "selecting"
  | "recording"
  | "stopped"
  | "error";

export type StatusVariant = "" | "ok" | "error";

export type FpsPresetId = "30" | "60" | "max";

export type ResolutionId = "native" | "1080p" | "1440p";

export interface MimeTypeOption {
  label: string;
  value: string;
}

export interface FpsPreset {
  id: FpsPresetId;
  label: string;
  summary: string;
}

export interface ResolutionOption {
  id: ResolutionId;
  label: string;
  summary?: string;
}

export interface EncodingSettings {
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
