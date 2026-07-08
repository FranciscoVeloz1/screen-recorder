import type { FpsPresetId, ResolutionId } from "../types/recording";
import {
  FPS_PRESETS,
  isFpsPresetId,
  isResolutionId,
  RESOLUTION_OPTIONS,
} from "../utils/recordingSettings";
import styles from "./RecordingOptions.module.css";

interface RecordingOptionsProps {
  fpsPresetId: FpsPresetId;
  resolutionId: ResolutionId;
  mimeType: string;
  includeSystemAudio: boolean;
  includeMicrophone: boolean;
  supportedMimeTypes: { label: string; value: string }[];
  disabled: boolean;
  onFpsPresetChange: (id: FpsPresetId) => void;
  onResolutionChange: (id: ResolutionId) => void;
  onMimeTypeChange: (type: string) => void;
  onIncludeSystemAudioChange: (enabled: boolean) => void;
  onIncludeMicrophoneChange: (enabled: boolean) => void;
}

function AudioToggle({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className={styles.optionGroup}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <label className={styles.toggleRow} htmlFor={id}>
        <span className={styles.toggle}>
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => {
              onChange(e.target.checked);
            }}
          />
          <span className={styles.slider} />
        </span>
        <span>{checked ? "Activado" : "Desactivado"}</span>
      </label>
    </div>
  );
}

export function RecordingOptions({
  fpsPresetId,
  resolutionId,
  mimeType,
  includeSystemAudio,
  includeMicrophone,
  supportedMimeTypes,
  disabled,
  onFpsPresetChange,
  onResolutionChange,
  onMimeTypeChange,
  onIncludeSystemAudioChange,
  onIncludeMicrophoneChange,
}: RecordingOptionsProps) {
  return (
    <div className={styles.options}>
      <div className={styles.optionGroup}>
        <label htmlFor="fps">Cuadros por segundo</label>
        <select
          id="fps"
          value={fpsPresetId}
          disabled={disabled}
          onChange={(e) => {
            const value = e.target.value;
            if (isFpsPresetId(value)) {
              onFpsPresetChange(value);
            }
          }}
        >
          {FPS_PRESETS.map((preset) => {
            return (
              <option key={preset.id} value={preset.id}>
                {preset.label} ({preset.summary})
              </option>
            );
          })}
        </select>
      </div>

      <div className={styles.optionGroup}>
        <label htmlFor="resolution">Resolución</label>
        <select
          id="resolution"
          value={resolutionId}
          disabled={disabled}
          onChange={(e) => {
            const value = e.target.value;
            if (isResolutionId(value)) {
              onResolutionChange(value);
            }
          }}
        >
          {RESOLUTION_OPTIONS.map((option) => {
            return (
              <option key={option.id} value={option.id}>
                {option.summary
                  ? `${option.label} (${option.summary})`
                  : option.label}
              </option>
            );
          })}
        </select>
      </div>

      <div className={styles.optionGroup}>
        <label htmlFor="format">Formato</label>
        <select
          id="format"
          value={mimeType}
          disabled={disabled}
          onChange={(e) => {
            onMimeTypeChange(e.target.value);
          }}
        >
          {supportedMimeTypes.map((type) => {
            return (
              <option key={type.value || "default"} value={type.value}>
                {type.label}
              </option>
            );
          })}
        </select>
      </div>

      <AudioToggle
        id="include-system-audio"
        label="Audio del sistema"
        checked={includeSystemAudio}
        disabled={disabled}
        onChange={onIncludeSystemAudioChange}
      />

      <AudioToggle
        id="include-microphone"
        label="Micrófono"
        checked={includeMicrophone}
        disabled={disabled}
        onChange={onIncludeMicrophoneChange}
      />
    </div>
  );
}
