import type { MimeTypeOption } from "../types/recording";
import styles from "./RecordingOptions.module.css";

interface RecordingOptionsProps {
  quality: number;
  mimeType: string;
  includeAudio: boolean;
  supportedMimeTypes: MimeTypeOption[];
  disabled: boolean;
  onQualityChange: (bps: number) => void;
  onMimeTypeChange: (type: string) => void;
  onIncludeAudioChange: (enabled: boolean) => void;
}

export function RecordingOptions({
  quality,
  mimeType,
  includeAudio,
  supportedMimeTypes,
  disabled,
  onQualityChange,
  onMimeTypeChange,
  onIncludeAudioChange,
}: RecordingOptionsProps) {
  return (
    <div className={styles.options}>
      <div className={styles.optionGroup}>
        <label htmlFor="quality">Calidad de video</label>
        <select
          id="quality"
          value={quality}
          disabled={disabled}
          onChange={(e) => onQualityChange(Number(e.target.value))}
        >
          <option value={2_500_000}>Media (2.5 Mbps)</option>
          <option value={5_000_000}>Alta (5 Mbps)</option>
          <option value={8_000_000}>Muy alta (8 Mbps)</option>
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
