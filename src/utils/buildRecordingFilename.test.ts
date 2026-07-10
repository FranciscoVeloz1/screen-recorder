import { describe, expect, it } from "vitest";
import { buildRecordingFilename } from "./buildRecordingFilename";

describe("buildRecordingFilename", () => {
  it("uses webm extension for webm mime types", () => {
    const name = buildRecordingFilename("video/webm;codecs=vp9");
    expect(name).toMatch(/^grabacion_.*\.webm$/);
  });

  it("uses mp4 extension for mp4 mime types", () => {
    const name = buildRecordingFilename("video/mp4");
    expect(name).toMatch(/^grabacion_.*\.mp4$/);
  });
});
