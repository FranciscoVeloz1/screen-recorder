import { describe, expect, it } from "vitest";
import { formatBytes } from "./formatBytes";

describe("formatBytes", () => {
  it("formats kilobytes below 1 MB", () => {
    expect(formatBytes(512)).toBe("1 KB");
    expect(formatBytes(2048)).toBe("2 KB");
  });

  it("formats megabytes at or above 1 MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });
});
