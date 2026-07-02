import { useCallback, useMemo, useRef, useState } from "react";
import type {
  CaptureInfo,
  FpsPresetId,
  Recording,
  RecordingStatus,
  ResolutionId,
  StatusVariant,
} from "../types/recording";
import { buildRecordingFilename } from "../utils/buildRecordingFilename";
import { downloadFile } from "../utils/downloadFile";
import { readCaptureInfo } from "../utils/formatCaptureInfo";
import {
  getPreferredMimeType,
  getSupportedMimeTypes,
} from "../utils/getSupportedMimeTypes";
import {
  applyFpsBoost,
  buildVideoConstraints,
  calculateEncodingSettings,
  DEFAULT_FPS_PRESET_ID,
  DEFAULT_RESOLUTION_ID,
} from "../utils/recordingSettings";
import { useRecordingTimer } from "./useRecordingTimer";

function createRecordingId(): string {
  return crypto.randomUUID();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Permiso denegado o seleccion cancelada.";
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return "Error desconocido.";
}

export function useScreenRecorder() {
  const supportedMimeTypes = useMemo(() => getSupportedMimeTypes(), []);
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Listo para grabar");
  const [statusVariant, setStatusVariant] = useState<StatusVariant>("");
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [captureInfo, setCaptureInfo] = useState<CaptureInfo | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [fpsPresetId, setFpsPresetId] =
    useState<FpsPresetId>(DEFAULT_FPS_PRESET_ID);
  const [resolutionId, setResolutionId] = useState<ResolutionId>(
    DEFAULT_RESOLUTION_ID,
  );
  const [mimeType, setMimeType] = useState(() => getPreferredMimeType());
  const [includeAudio, setIncludeAudio] = useState(true);
  const [latestRecordingId, setLatestRecordingId] = useState<string | null>(
    null,
  );

  const timer = useRecordingTimer();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);

  const setStatusWithMessage = useCallback(
    (message: string, variant: StatusVariant = "") => {
      setStatusMessage(message);
      setStatusVariant(variant);
    },
    [],
  );

  const cleanupStreams = useCallback(() => {
    combinedStreamRef.current?.getTracks().forEach((track) => track.stop());
    combinedStreamRef.current = null;
    displayStreamRef.current = null;
    setPreviewStream(null);
    setCaptureInfo(null);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    cleanupStreams();
    timer.stop();
    setStatus("stopped");
  }, [cleanupStreams, timer]);

  const startRecording = useCallback(async () => {
    const encoding = calculateEncodingSettings(fpsPresetId, resolutionId);

    try {
      setStatus("selecting");
      setStatusWithMessage("Selecciona la pantalla a grabar...");

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: buildVideoConstraints(fpsPresetId, resolutionId),
        audio: includeAudio,
      });
      displayStreamRef.current = displayStream;

      let audioStream: MediaStream | null = null;
      if (includeAudio) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
            video: false,
          });
        } catch (micError) {
          if (
            micError instanceof DOMException &&
            micError.name === "NotAllowedError"
          ) {
            // Mic denied — continue without it
          } else if (micError instanceof Error) {
            console.warn("Microphone unavailable:", micError.message);
          }
        }
      }

      const tracks = [...displayStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);
      combinedStreamRef.current = combinedStream;

      setPreviewStream(displayStream);

      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        await applyFpsBoost(videoTrack, fpsPresetId);
        setCaptureInfo(
          readCaptureInfo(
            videoTrack,
            mimeType,
            supportedMimeTypes,
            encoding.videoBitsPerSecond,
          ),
        );
      }

      const options: MediaRecorderOptions = {
        videoBitsPerSecond: encoding.videoBitsPerSecond,
        audioBitsPerSecond: encoding.audioBitsPerSecond,
      };
      if (mimeType) options.mimeType = mimeType;

      const recorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const name = buildRecordingFilename(recorder.mimeType || "video/webm");
        const id = createRecordingId();

        const recording: Recording = {
          id,
          url,
          name,
          duration: timer.getSeconds(),
          size: blob.size,
        };

        setRecordings((prev) => [...prev, recording]);
        setLatestRecordingId(id);
        setStatus("stopped");
        setStatusWithMessage(
          "Grabacion finalizada. Listo para descargar.",
          "ok",
        );
      };

      if (videoTrack) {
        videoTrack.onended = () => {
          if (recorder.state !== "inactive") stopRecording();
        };
      }

      recorder.start(1000);
      timer.start();
      setStatus("recording");
      setStatusWithMessage("Grabando...");
    } catch (error) {
      cleanupStreams();
      timer.reset();
      setStatus("error");
      setStatusWithMessage(getErrorMessage(error), "error");
    }
  }, [
    cleanupStreams,
    fpsPresetId,
    includeAudio,
    mimeType,
    resolutionId,
    setStatusWithMessage,
    stopRecording,
    supportedMimeTypes,
    timer,
  ]);

  const downloadLatest = useCallback(() => {
    if (!latestRecordingId) return;
    const recording = recordings.find((r) => r.id === latestRecordingId);
    if (recording) downloadFile(recording.url, recording.name);
  }, [latestRecordingId, recordings]);

  const downloadRecording = useCallback(
    (id: string) => {
      const recording = recordings.find((r) => r.id === id);
      if (recording) downloadFile(recording.url, recording.name);
    },
    [recordings],
  );

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((r) => r.id !== id);
    });
    setLatestRecordingId((prev) => (prev === id ? null : prev));
  }, []);

  const isRecording = status === "recording";
  const canStart = status !== "recording" && status !== "selecting";
  const canStop = status === "recording";
  const canDownloadLatest =
    !isRecording &&
    latestRecordingId !== null &&
    recordings.some((r) => r.id === latestRecordingId);

  return {
    status,
    statusMessage,
    statusVariant,
    isRecording,
    canStart,
    canStop,
    canDownloadLatest,
    previewStream,
    captureInfo,
    recordings,
    fpsPresetId,
    resolutionId,
    mimeType,
    includeAudio,
    supportedMimeTypes,
    timerFormatted: timer.formatted,
    setFpsPresetId,
    setResolutionId,
    setMimeType,
    setIncludeAudio,
    startRecording,
    stopRecording,
    downloadLatest,
    downloadRecording,
    deleteRecording,
  };
}

export type UseScreenRecorderReturn = ReturnType<typeof useScreenRecorder>;
