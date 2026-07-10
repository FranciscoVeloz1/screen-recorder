import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class MockMediaRecorder {
  static isTypeSupported(type: string): boolean {
    return type.includes("webm");
  }

  state = "inactive";
  mimeType = "video/webm;codecs=vp9";

  stop(): void {}

  start(): void {}

  requestData(): void {}
}

vi.stubGlobal("MediaRecorder", MockMediaRecorder);
