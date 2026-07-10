import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScreenRecorder } from "./useScreenRecorder";

type RecorderHandler = (() => void) | null;

class ControllableMediaRecorder {
  static isTypeSupported(type: string): boolean {
    return type.includes("webm");
  }

  state: "inactive" | "recording" | "paused" = "inactive";
  mimeType = "video/webm;codecs=vp9";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: RecorderHandler = null;
  onstop: RecorderHandler = null;
  private stopped = false;

  start(): void {
    this.state = "recording";
  }

  requestData(): void {
    this.ondataavailable?.({
      data: new Blob(["chunk"], { type: this.mimeType }),
    });
  }

  stop(): void {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["final"], { type: this.mimeType }),
    });
    this.onstop?.();
  }
}

function createFakeTrack(kind: "video" | "audio"): MediaStreamTrack {
  return {
    kind,
    stop: vi.fn(),
    onended: null,
    getSettings: () => {
      return { width: 1920, height: 1080, frameRate: 60 };
    },
    applyConstraints: vi.fn(async () => {
      return undefined;
    }),
  } as unknown as MediaStreamTrack;
}

function createFakeStream(tracks: MediaStreamTrack[]): MediaStream {
  return {
    getTracks: () => {
      return tracks;
    },
    getVideoTracks: () => {
      return tracks.filter((track) => {
        return track.kind === "video";
      });
    },
    getAudioTracks: () => {
      return tracks.filter((track) => {
        return track.kind === "audio";
      });
    },
  } as unknown as MediaStream;
}

describe("useScreenRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("MediaRecorder", ControllableMediaRecorder);
    vi.stubGlobal(
      "MediaStream",
      class {
        constructor(public tracks: MediaStreamTrack[] = []) {}
        getTracks() {
          return this.tracks;
        }
        getVideoTracks() {
          return this.tracks.filter((track) => {
            return track.kind === "video";
          });
        }
        getAudioTracks() {
          return this.tracks.filter((track) => {
            return track.kind === "audio";
          });
        }
      },
    );
    vi.stubGlobal("crypto", {
      randomUUID: () => {
        return "recording-id";
      },
    });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => {
        return "blob:recording";
      }),
      revokeObjectURL: vi.fn(),
    });

    const videoTrack = createFakeTrack("video");
    const displayStream = createFakeStream([videoTrack]);

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getDisplayMedia: vi.fn(async () => {
          return displayStream;
        }),
        getUserMedia: vi.fn(async () => {
          return createFakeStream([createFakeTrack("audio")]);
        }),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts idle with microphone off by default", () => {
    const { result } = renderHook(() => {
      return useScreenRecorder();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.includeSystemAudio).toBe(true);
    expect(result.current.includeMicrophone).toBe(false);
    expect(result.current.recordings).toEqual([]);
  });

  it("keeps recording after the timer ticks", async () => {
    const { result } = renderHook(() => {
      return useScreenRecorder();
    });

    await act(async () => {
      await result.current.startRecording();
    });

    expect(
      result.current.status,
      result.current.statusMessage,
    ).toBe("recording");

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      result.current.status,
      result.current.statusMessage,
    ).toBe("recording");
    expect(result.current.timerSeconds).toBe(1);
  });

  it("does not re-render unboundedly while the timer ticks", async () => {
    let renders = 0;

    const { result } = renderHook(() => {
      renders += 1;
      return useScreenRecorder();
    });

    await act(async () => {
      await result.current.startRecording();
    });

    const rendersAfterStart = renders;

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // One render per second for the timer display, plus a small buffer.
    expect(renders - rendersAfterStart).toBeLessThanOrEqual(6);
    expect(result.current.status).toBe("recording");
    expect(result.current.timerSeconds).toBe(5);
  });
});
