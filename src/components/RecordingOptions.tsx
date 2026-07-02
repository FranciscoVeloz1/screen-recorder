import type { FpsPresetId, ResolutionId } from "../types/recording";
import { FPS_PRESETS, RESOLUTION_OPTIONS } from "../utils/recordingSettings";
import styles from "./RecordingOptions.module.css";

interface RecordingOptionsProps {
  fpsPresetId: FpsPresetId;
  resolutionId: ResolutionId;
  mimeType: string;
  includeAudio: boolean;
  supportedMimeTypes: { label: string; value: string }[];
  disabled: boolean;
  onFpsPresetChange: (id: FpsPresetId) => void;
  onResolutionChange: (id: ResolutionId) => void;
  onMimeTypeChange: (type: string) => void;
  onIncludeAudioChange: (enabled: boolean) => void;
}

export function RecordingOptions({
  fpsPresetId,
  resolutionId,
  mimeType,
  includeAudio,
  supportedMimeTypes,
  disabled,
  onFpsPresetChange,
  onResolutionChange,
  onMimeTypeChange,
  onIncludeAudioChange,
}: RecordingOptionsProps) {
  return (
    <div className={styles.options}>
      <div className={styles.optionGroup}>
        <label htmlFor="fps">Cuadros por segundo</label>
        <select
          id="fps"
          value={fpsPresetId}
          disabled={disabled}
          onChange={(e) => onFpsPresetChange(e.target.value as FpsPresetId)}
        >
          {FPS_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label} ({preset.summary})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.optionGroup}>
        <label htmlFor="resolution">Resolución</label>
        <select
          id="resolution"
          value={resolutionId}
          disabled={disabled}
          onChange={(e) => onResolutionChange(e.target.value as ResolutionId)}
        >
          {RESOLUTION_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.summary
                ? `${option.label} (${option.summary})`
                : option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.optionGroup}>
        <label htmlFor="format">Formato</label>
        <select
          id="format"
          value={mimeType}
          disabled={disabled}
          onChange={(e) => onMimeTypeChange(e.target.value)}
        >
          {supportedMimeTypes.map((type) => (
            <option key={type.value || "default"} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.optionGroup} ${styles.audioGroup}`}>
        <span className={styles.fieldLabel}>Incluir audio del sistema</span>
        <label className={styles.toggleRow}>
          <span className={styles.toggle}>
            <input
              type="checkbox"
              checked={includeAudio}
              disabled={disabled}
              onChange={(e) => onIncludeAudioChange(e.target.checked)}
            />
            <span className={styles.slider} />
          </span>
          <span>{includeAudio ? "Activado" : "Desactivado"}</span>
        </label>
      </div>
    </div>
  );
}
