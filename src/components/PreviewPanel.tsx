import { useEffect, useRef } from "react";
import { MonitorIcon } from "./icons/Icons";
import styles from "./PreviewPanel.module.css";

interface PreviewPanelProps {
  previewStream: MediaStream | null;
  isRecording: boolean;
  timerFormatted: string;
}

export function PreviewPanel({
  previewStream,
  isRecording,
  timerFormatted,
}: PreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = previewStream;
  }, [previewStream]);

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
          <span className={styles.dot} />
          <span>{timerFormatted}</span>
        </div>
      )}
    </div>
  );
}
