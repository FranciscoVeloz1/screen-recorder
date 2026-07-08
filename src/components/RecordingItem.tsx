import { useState } from "react";
import type { Recording } from "../types/recording";
import { formatBytes } from "../utils/formatBytes";
import { formatTime } from "../utils/formatTime";
import styles from "./RecordingItem.module.css";

interface RecordingItemProps {
  recording: Recording;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecordingItem({
  recording,
  onDownload,
  onDelete,
}: RecordingItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(recording.id);
    setConfirmingDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
  };

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{recording.name}</span>
        <span className={styles.meta}>
          {formatTime(recording.duration)} · {formatBytes(recording.size)}
        </span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.download}
          onClick={() => {
            onDownload(recording.id);
          }}
        >
          Descargar
        </button>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              className={styles.confirmDelete}
              onClick={handleDeleteClick}
            >
              Confirmar
            </button>
            <button
              type="button"
              className={styles.cancelDelete}
              onClick={handleCancelDelete}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.delete}
            onClick={handleDeleteClick}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
