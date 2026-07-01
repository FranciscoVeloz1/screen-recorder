import type { QualityPreset, QualityPresetId } from "../types/recording";

export const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: "1080p30",
    label: "1080p · 30 fps",
    summary: "8 Mbps video",
    videoConstraints: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
    videoBitsPerSecond: 8_000_000,
    audioBitsPerSecond: 192_000,
  },
  {
    id: "1080p60",
    label: "1080p · 60 fps",
    summary: "12 Mbps video",
    videoConstraints: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 60, max: 60 },
    },
    videoBitsPerSecond: 12_000_000,
    audioBitsPerSecond: 192_000,
  },
  {
    id: "1440p60",
    label: "1440p · 60 fps",
    summary: "16 Mbps video",
    videoConstraints: {
      width: { ideal: 2560 },
      height: { ideal: 1440 },
      frameRate: { ideal: 60, max: 60 },
    },
    videoBitsPerSecond: 16_000_000,
    audioBitsPerSecond: 256_000,
  },
  {
    id: "max",
    label: "Máxima calidad",
    summary: "25 Mbps video",
    videoConstraints: {
      frameRate: { ideal: 60, max: 60 },
    },
    videoBitsPerSecond: 25_000_000,
    audioBitsPerSecond: 320_000,
  },
];

export const DEFAULT_QUALITY_PRESET_ID: QualityPresetId = "1080p60";

export function getQualityPreset(id: QualityPresetId): QualityPreset {
  const preset = QUALITY_PRESETS.find((p) => p.id === id);
  return preset ?? QUALITY_PRESETS[1];
}
