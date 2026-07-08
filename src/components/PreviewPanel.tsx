import { useEffect, useRef } from "react";
import { MonitorIcon } from "./icons/Icons";
import styles from "./PreviewPanel.module.css";

interface PreviewPanelProps {
  previewStream: MediaStream | null;
  isRecording: boolean;
  timerFormatted: string;
  timerSeconds: number;
}

export function PreviewPanel({
  previewStream,
  isRecording,
  timerFormatted,
  timerSeconds,
}: PreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = previewStream;

    if (previewStream) {
      void video.play().catch(() => {
        // Autoplay may be blocked; preview stays blank until user interaction
      });
    }
  }, [previewStream]);

  const announcedTime =
    isRecording && timerSeconds > 0 && timerSeconds % 10 === 0
      ? timerFormatted
      : "";

  const showPreview = previewStream !== null;

  return (
    <div className={styles.previewWrap}>
      {!showPreview && (
        <div className={styles.placeholder}>
          <MonitorIcon />
          <p>La vista previa aparecerá aquí</p>
        </div>
      )}
      <video
        ref={videoRef}
        className={showPreview ? styles.videoVisible : styles.videoHidden}
        autoPlay
        muted
        playsInline
      />
      {isRecording && (
        <div className={styles.timer}>
          <span className={styles.dot} aria-hidden="true" />
          <span aria-hidden="true">{timerFormatted}</span>
          <span className={styles.srOnly} aria-live="polite">
            {announcedTime ? `Tiempo de grabación: ${announcedTime}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
