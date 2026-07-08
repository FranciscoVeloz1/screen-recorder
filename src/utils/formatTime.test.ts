import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats seconds as MM:SS under one hour", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(3599)).toBe("59:59");
  });

  it("formats seconds as HH:MM:SS at or above one hour", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(5400)).toBe("01:30:00");
  });
});
