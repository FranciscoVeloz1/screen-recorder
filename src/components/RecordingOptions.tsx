import type { QualityPresetId } from "../types/recording";
import { QUALITY_PRESETS } from "../utils/qualityPresets";
import styles from "./RecordingOptions.module.css";

interface RecordingOptionsProps {
  qualityPresetId: QualityPresetId;
  mimeType: string;
  includeAudio: boolean;
  supportedMimeTypes: { label: string; value: string }[];
  disabled: boolean;
  onQualityPresetChange: (id: QualityPresetId) => void;
  onMimeTypeChange: (type: string) => void;
  onIncludeAudioChange: (enabled: boolean) => void;
}

export function RecordingOptions({
  qualityPresetId,
  mimeType,
  includeAudio,
  supportedMimeTypes,
  disabled,
  onQualityPresetChange,
  onMimeTypeChange,
  onIncludeAudioChange,
}: RecordingOptionsProps) {
  return (
    <div className={styles.options}>
      <div className={styles.optionGroup}>
        <label htmlFor="quality">Calidad de video</label>
        <select
          id="quality"
          value={qualityPresetId}
          disabled={disabled}
          onChange={(e) =>
            onQualityPresetChange(e.target.value as QualityPresetId)
          }
        >
          {QUALITY_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label} ({preset.summary})
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
