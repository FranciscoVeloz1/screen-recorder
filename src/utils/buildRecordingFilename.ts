export function buildRecordingFilename(mimeType: string): string {
  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `grabacion_${timestamp}.${ext}`;
}
