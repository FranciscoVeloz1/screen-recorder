import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupportedMimeTypes } from "./getSupportedMimeTypes";

describe("getSupportedMimeTypes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("MediaRecorder", class {
      static isTypeSupported(type: string): boolean {
        return type.includes("webm");
      }
    });
  });

  it("returns default option when no mime types are supported", () => {
    vi.stubGlobal("MediaRecorder", class {
      static isTypeSupported(): boolean {
        return false;
      }
    });

    expect(getSupportedMimeTypes()).toEqual([
      { label: "Formato por defecto", value: "" },
    ]);
  });
});
