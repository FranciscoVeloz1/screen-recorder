import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
    return "Permiso denegado o selección cancelada.";
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return "Error desconocido.";
}

function createMediaRecorder(
  stream: MediaStream,
  options: MediaRecorderOptions,
): MediaRecorder {
  try {
    return new MediaRecorder(stream, options);
  } catch {
    const fallbackOptions: MediaRecorderOptions = {
      videoBitsPerSecond: options.videoBitsPerSecond,
      audioBitsPerSecond: options.audioBitsPerSecond,
    };
    return new MediaRecorder(stream, fallbackOptions);
  }
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
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [includeMicrophone, setIncludeMicrophone] = useState(false);
  const [latestRecordingId, setLatestRecordingId] = useState<string | null>(
    null,
  );

  const timer = useRecordingTimer();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const isStoppingRef = useRef(false);
  const recorderErrorRef = useRef(false);
  const recordingsRef = useRef<Recording[]>([]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const setStatusWithMessage = useCallback(
    (message: string, variant: StatusVariant = "") => {
      setStatusMessage(message);
      setStatusVariant(variant);
    },
    [],
  );

  const cleanupStreams = useCallback(() => {
    combinedStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    combinedStreamRef.current = null;
    displayStreamRef.current = null;
    setPreviewStream(null);
    setCaptureInfo(null);
  }, []);

  const clearVideoTrackHandler = useCallback(() => {
    if (videoTrackRef.current) {
      videoTrackRef.current.onended = null;
      videoTrackRef.current = null;
    }
  }, []);

  const finalizeAfterStop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      isStoppingRef.current = false;
      return;
    }

    const blob = new Blob(chunksRef.current, {
      type: recorder.mimeType || "video/webm",
    });

    const hadError = recorderErrorRef.current;

    if (blob.size > 0 && !hadError) {
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

      setRecordings((prev) => {
        return [...prev, recording];
      });
      setLatestRecordingId(id);
    }

    cleanupStreams();
    timer.stop();
    clearVideoTrackHandler();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    isStoppingRef.current = false;
    recorderErrorRef.current = false;

    if (hadError) {
      setStatus("error");
      setStatusWithMessage("Error durante la grabación.", "error");
    } else {
      setStatus("stopped");
      if (blob.size > 0) {
        setStatusWithMessage(
          "Grabación finalizada. Listo para descargar.",
          "ok",
        );
      } else {
        setStatusWithMessage("La grabación quedó vacía.", "error");
      }
    }
  }, [
    cleanupStreams,
    clearVideoTrackHandler,
    setStatusWithMessage,
    timer.getSeconds,
    timer.stop,
  ]);

  const stopRecording = useCallback(() => {
    if (isStoppingRef.current) {
      return;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    isStoppingRef.current = true;
    setStatusWithMessage("Finalizando grabación...");

    try {
      if (recorder.state === "recording") {
        recorder.requestData();
      }
      recorder.stop();
    } catch {
      isStoppingRef.current = false;
      cleanupStreams();
      timer.stop();
      clearVideoTrackHandler();
      mediaRecorderRef.current = null;
      setStatus("error");
      setStatusWithMessage("Error al detener la grabación.", "error");
    }
  }, [cleanupStreams, clearVideoTrackHandler, setStatusWithMessage, timer.stop]);

  const handleRecorderError = useCallback(() => {
    if (isStoppingRef.current) {
      return;
    }

    recorderErrorRef.current = true;
    setStatusWithMessage("Error durante la grabación.", "error");

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      isStoppingRef.current = true;
      try {
        if (recorder.state === "recording") {
          recorder.requestData();
        }
        recorder.stop();
      } catch {
        isStoppingRef.current = false;
        cleanupStreams();
        timer.stop();
        clearVideoTrackHandler();
        mediaRecorderRef.current = null;
        setStatus("error");
        setStatusWithMessage("Error durante la grabación.", "error");
      }
    } else {
      cleanupStreams();
      timer.stop();
      clearVideoTrackHandler();
      mediaRecorderRef.current = null;
      setStatus("error");
      setStatusWithMessage("Error durante la grabación.", "error");
    }
  }, [cleanupStreams, clearVideoTrackHandler, setStatusWithMessage, timer.stop]);

  const startRecording = useCallback(async () => {
    const encoding = calculateEncodingSettings(fpsPresetId, resolutionId);

    try {
      setStatus("selecting");
      setStatusWithMessage("Selecciona la pantalla a grabar...");
      recorderErrorRef.current = false;
      isStoppingRef.current = false;

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: buildVideoConstraints(fpsPresetId, resolutionId),
        audio: includeSystemAudio,
      });
      displayStreamRef.current = displayStream;

      let audioStream: MediaStream | null = null;
      let micWarning: string | null = null;

      if (includeMicrophone) {
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
            micWarning =
              "Micrófono no disponible; grabando sin micrófono.";
          } else if (micError instanceof Error) {
            micWarning = `Micrófono no disponible: ${micError.message}`;
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
        videoTrackRef.current = videoTrack;
      }

      const options: MediaRecorderOptions = {
        videoBitsPerSecond: encoding.videoBitsPerSecond,
        audioBitsPerSecond: encoding.audioBitsPerSecond,
      };
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const recorder = createMediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      if (videoTrack) {
        setCaptureInfo(
          readCaptureInfo(
            videoTrack,
            recorder.mimeType || mimeType,
            supportedMimeTypes,
            encoding.videoBitsPerSecond,
          ),
        );
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        handleRecorderError();
      };

      recorder.onstop = () => {
        finalizeAfterStop();
      };

      if (videoTrack) {
        videoTrack.onended = () => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            stopRecording();
          }
        };
      }

      recorder.start(1000);
      timer.start();
      setStatus("recording");
      if (micWarning) {
        setStatusWithMessage(`Grabando... ${micWarning}`);
      } else {
        setStatusWithMessage("Grabando...");
      }
    } catch (error) {
      cleanupStreams();
      clearVideoTrackHandler();
      timer.reset();
      mediaRecorderRef.current = null;
      isStoppingRef.current = false;
      recorderErrorRef.current = false;
      setStatus("error");
      setStatusWithMessage(getErrorMessage(error), "error");
    }
  }, [
    cleanupStreams,
    clearVideoTrackHandler,
    finalizeAfterStop,
    fpsPresetId,
    handleRecorderError,
    includeMicrophone,
    includeSystemAudio,
    mimeType,
    resolutionId,
    setStatusWithMessage,
    stopRecording,
    supportedMimeTypes,
    timer.reset,
    timer.start,
  ]);

  useEffect(() => {
    const stopTimer = timer.stop;

    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // Best-effort teardown on unmount
        }
      }

      combinedStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      combinedStreamRef.current = null;

      recordingsRef.current.forEach((recording) => {
        URL.revokeObjectURL(recording.url);
      });

      stopTimer();
    };
  }, [timer.stop]);

  const reportDownloadFailure = useCallback(() => {
    setStatusWithMessage("Error al descargar el archivo.", "error");
  }, [setStatusWithMessage]);

  const downloadLatest = useCallback(() => {
    if (!latestRecordingId) {
      return;
    }
    const recording = recordings.find((r) => {
      return r.id === latestRecordingId;
    });
    if (recording) {
      const success = downloadFile(recording.url, recording.name);
      if (!success) {
        reportDownloadFailure();
      }
    }
  }, [latestRecordingId, recordings, reportDownloadFailure]);

  const downloadRecording = useCallback(
    (id: string) => {
      const recording = recordings.find((r) => {
        return r.id === id;
      });
      if (recording) {
        const success = downloadFile(recording.url, recording.name);
        if (!success) {
          reportDownloadFailure();
        }
      }
    },
    [recordings, reportDownloadFailure],
  );

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => {
        return r.id === id;
      });
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((r) => {
        return r.id !== id;
      });
    });
    setLatestRecordingId((prev) => {
      return prev === id ? null : prev;
    });
  }, []);

  const isRecording = status === "recording";
  const canStart = status !== "recording" && status !== "selecting";
  const canStop = status === "recording";
  const canDownloadLatest =
    !isRecording &&
    latestRecordingId !== null &&
    recordings.some((r) => {
      return r.id === latestRecordingId;
    });

  return useMemo(() => {
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
      includeSystemAudio,
      includeMicrophone,
      supportedMimeTypes,
      timerFormatted: timer.formatted,
      timerSeconds: timer.seconds,
      setFpsPresetId,
      setResolutionId,
      setMimeType,
      setIncludeSystemAudio,
      setIncludeMicrophone,
      startRecording,
      stopRecording,
      downloadLatest,
      downloadRecording,
      deleteRecording,
    };
  }, [
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
    includeSystemAudio,
    includeMicrophone,
    supportedMimeTypes,
    timer.formatted,
    timer.seconds,
    startRecording,
    stopRecording,
    downloadLatest,
    downloadRecording,
    deleteRecording,
  ]);
}

export type UseScreenRecorderReturn = ReturnType<typeof useScreenRecorder>;
