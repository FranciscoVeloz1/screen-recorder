import type { ReactNode } from "react";
import styles from "./RecorderCard.module.css";

interface RecorderCardProps {
  children: ReactNode;
}

export function RecorderCard({ children }: RecorderCardProps) {
  return <div className={styles.card}>{children}</div>;
}
