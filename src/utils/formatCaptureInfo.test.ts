import { describe, expect, it } from "vitest";
import { getMimeLabel } from "./formatCaptureInfo";
import type { MimeTypeOption } from "../types/recording";

const supported: MimeTypeOption[] = [
  { label: "WebM (VP9)", value: "video/webm;codecs=vp9" },
  { label: "MP4", value: "video/mp4" },
];

describe("getMimeLabel", () => {
  it("returns matching label from supported list", () => {
    expect(getMimeLabel("video/mp4", supported)).toBe("MP4");
  });

  it("returns fallback labels for unknown mime types", () => {
    expect(getMimeLabel("", supported)).toBe("Por defecto");
    expect(getMimeLabel("video/webm;codecs=vp9", [])).toBe("WebM (VP9)");
  });
});
