import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScreenRecorder } from "./useScreenRecorder";

describe("useScreenRecorder", () => {
  it("starts idle with microphone off by default", () => {
    const { result } = renderHook(() => {
      return useScreenRecorder();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.includeSystemAudio).toBe(true);
    expect(result.current.includeMicrophone).toBe(false);
    expect(result.current.recordings).toEqual([]);
  });
});
