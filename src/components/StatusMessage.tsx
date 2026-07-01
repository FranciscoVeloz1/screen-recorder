import type { StatusVariant } from "../types/recording";
import styles from "./StatusMessage.module.css";

interface StatusMessageProps {
  message: string;
  variant: StatusVariant;
}

export function StatusMessage({ message, variant }: StatusMessageProps) {
  const className = [styles.status, variant ? styles[variant] : ""]
    .filter(Boolean)
    .join(" ");

  return <p className={className}>{message}</p>;
}
