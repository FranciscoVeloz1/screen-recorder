import { describe, expect, it } from "vitest";
import { calculateEncodingSettings } from "./recordingSettings";

describe("calculateEncodingSettings", () => {
  it("scales bitrate with fps and resolution", () => {
    const base = calculateEncodingSettings("30", "native");
    const higher = calculateEncodingSettings("60", "1440p");

    expect(base.videoBitsPerSecond).toBe(4_000_000);
    expect(higher.videoBitsPerSecond).toBeGreaterThan(base.videoBitsPerSecond);
    expect(higher.audioBitsPerSecond).toBe(192_000);
  });
});
