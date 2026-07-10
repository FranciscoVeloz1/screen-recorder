import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecordingOptions } from ".";

describe("RecordingOptions", () => {
  it("disables controls when recording", () => {
    render(
      <RecordingOptions
        fpsPresetId="60"
        resolutionId="native"
        mimeType="video/webm;codecs=vp9"
        includeSystemAudio={true}
        includeMicrophone={false}
        supportedMimeTypes={[
          { label: "WebM (VP9)", value: "video/webm;codecs=vp9" },
        ]}
        disabled={true}
        onFpsPresetChange={vi.fn()}
        onResolutionChange={vi.fn()}
        onMimeTypeChange={vi.fn()}
        onIncludeSystemAudioChange={vi.fn()}
        onIncludeMicrophoneChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Cuadros por segundo")).toBeDisabled();
    expect(screen.getByLabelText("Audio del sistema")).toBeDisabled();
    expect(screen.getByLabelText("Micrófono")).toBeDisabled();
  });
});
