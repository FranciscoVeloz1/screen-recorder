import type { Recording } from "../types/recording";
import { RecordingItem } from "./RecordingItem";
import styles from "./RecordingsList.module.css";

interface RecordingsListProps {
  recordings: Recording[];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecordingsList({
  recordings,
  onDownload,
  onDelete,
}: RecordingsListProps) {
  if (recordings.length === 0) return null;

  return (
    <section className={styles.recordings} aria-label="Grabaciones de esta sesion">
      <h2>Grabaciones de esta sesion</h2>
      <div className={styles.list}>
        {recordings.map((recording) => (
          <RecordingItem
            key={recording.id}
            recording={recording}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
