import { DownloadIcon, RecordIcon, StopIcon } from "../icons/Icons";
import styles from "./RecordingControls.module.css";

interface RecordingControlsProps {
  canStart: boolean;
  canStop: boolean;
  canDownloadLatest: boolean;
  onStart: () => void;
  onStop: () => void;
  onDownload: () => void;
}

export function RecordingControls({
  canStart,
  canStop,
  canDownloadLatest,
  onStart,
  onStop,
  onDownload,
}: RecordingControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.start}
        disabled={!canStart}
        onClick={onStart}
      >
        <RecordIcon />
        Grabar
      </button>
      <button
        type="button"
        className={styles.stop}
        disabled={!canStop}
        onClick={onStop}
      >
        <StopIcon />
        Detener
      </button>
      <button
        type="button"
        className={styles.download}
        disabled={!canDownloadLatest}
        onClick={onDownload}
      >
        <DownloadIcon />
        Descargar
      </button>
    </div>
  );
}
