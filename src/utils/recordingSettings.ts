import type {
  EncodingSettings,
  FpsPreset,
  FpsPresetId,
  ResolutionId,
  ResolutionOption,
} from "../types/recording";

export const FPS_PRESETS: FpsPreset[] = [
  { id: "30", label: "30 fps", summary: "Estándar" },
  { id: "60", label: "60 fps", summary: "Fluido" },
  { id: "max", label: "Máximo", summary: "Lo máximo del navegador" },
];

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { id: "native", label: "Nativa", summary: "Recomendado para FPS" },
  { id: "1080p", label: "1080p" },
  { id: "1440p", label: "1440p" },
];

export const DEFAULT_FPS_PRESET_ID: FpsPresetId = "60";
export const DEFAULT_RESOLUTION_ID: ResolutionId = "native";

export function isFpsPresetId(value: string): value is FpsPresetId {
  return FPS_PRESETS.some((preset) => {
    return preset.id === value;
  });
}

export function isResolutionId(value: string): value is ResolutionId {
  return RESOLUTION_OPTIONS.some((option) => {
    return option.id === value;
  });
}

export function buildVideoConstraints(
  fps: FpsPresetId,
  resolution: ResolutionId,
): MediaTrackConstraints {
  const constraints: MediaTrackConstraints = {};

  if (resolution === "1080p") {
    constraints.width = { ideal: 1920 };
    constraints.height = { ideal: 1080 };
  } else if (resolution === "1440p") {
    constraints.width = { ideal: 2560 };
    constraints.height = { ideal: 1440 };
  }

  if (fps === "30") {
    constraints.frameRate = { ideal: 30, max: 30 };
  } else if (fps === "60") {
    constraints.frameRate = { ideal: 60, max: 60 };
  } else {
    constraints.frameRate = { ideal: 60, max: 120 };
  }

  return constraints;
}

export async function applyFpsBoost(
  track: MediaStreamTrack,
  fps: FpsPresetId,
): Promise<void> {
  if (fps !== "max") return;

  try {
    await track.applyConstraints({ frameRate: { ideal: 60, max: 120 } });
  } catch {
    // El navegador puede rechazar un fps más alto — se mantiene el negociado
  }
}

export function calculateEncodingSettings(
  fps: FpsPresetId,
  resolution: ResolutionId,
): EncodingSettings {
  const fpsMultiplier = fps === "30" ? 1 : fps === "60" ? 2 : 2.5;
  const resolutionMultiplier =
    resolution === "native" ? 1 : resolution === "1080p" ? 1.2 : 1.6;

  const baseVideoBitrate = 4_000_000;

  return {
    videoBitsPerSecond: Math.round(
      baseVideoBitrate * fpsMultiplier * resolutionMultiplier,
    ),
    audioBitsPerSecond: 192_000,
  };
}
