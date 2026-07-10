import type { CaptureInfo as CaptureInfoData } from "../../types/recording";
import { formatCaptureInfo } from "../../utils/formatCaptureInfo";
import styles from "./CaptureInfo.module.css";

interface CaptureInfoProps {
  info: CaptureInfoData | null;
}

export function CaptureInfo({ info }: CaptureInfoProps) {
  if (!info || info.width === 0) return null;

  return (
    <p className={styles.info} aria-live="polite">
      {formatCaptureInfo(info)}
    </p>
  );
}
