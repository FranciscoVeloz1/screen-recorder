export type RecordingStatus =
  | "idle"
  | "selecting"
  | "recording"
  | "stopped"
  | "error";

export type StatusVariant = "" | "ok" | "error";

export interface MimeTypeOption {
  label: string;
  value: string;
}

export interface Recording {
  id: string;
  url: string;
  name: string;
  duration: number;
  size: number;
}
