import { CaptureInfo } from "./components/CaptureInfo";
import { Header } from "./components/Header";
import { PreviewPanel } from "./components/PreviewPanel";
import { RecorderCard } from "./components/RecorderCard";
import { RecordingControls } from "./components/RecordingControls";
import { RecordingOptions } from "./components/RecordingOptions";
import { RecordingsList } from "./components/RecordingsList";
import { StatusMessage } from "./components/StatusMessage";
import { useScreenRecorder } from "./hooks/useScreenRecorder";

const App = () => {
  const recorder = useScreenRecorder();
  const optionsDisabled =
    recorder.status === "recording" || recorder.status === "selecting";

  return (
    <>
      <Header />
      <main>
        <RecorderCard>
          <RecordingOptions
            fpsPresetId={recorder.fpsPresetId}
            resolutionId={recorder.resolutionId}
            mimeType={recorder.mimeType}
            includeSystemAudio={recorder.includeSystemAudio}
            includeMicrophone={recorder.includeMicrophone}
            supportedMimeTypes={recorder.supportedMimeTypes}
            disabled={optionsDisabled}
            onFpsPresetChange={recorder.setFpsPresetId}
            onResolutionChange={recorder.setResolutionId}
            onMimeTypeChange={recorder.setMimeType}
            onIncludeSystemAudioChange={recorder.setIncludeSystemAudio}
            onIncludeMicrophoneChange={recorder.setIncludeMicrophone}
          />

          <PreviewPanel
            previewStream={recorder.previewStream}
            isRecording={recorder.isRecording}
            timerFormatted={recorder.timerFormatted}
            timerSeconds={recorder.timerSeconds}
          />

          <CaptureInfo
            info={recorder.isRecording ? recorder.captureInfo : null}
          />

          <RecordingControls
            canStart={recorder.canStart}
            canStop={recorder.canStop}
            canDownloadLatest={recorder.canDownloadLatest}
            onStart={() => {
              void recorder.startRecording();
            }}
            onStop={recorder.stopRecording}
            onDownload={recorder.downloadLatest}
          />

          <StatusMessage
            message={recorder.statusMessage}
            variant={recorder.statusVariant}
          />

          <RecordingsList
            recordings={recorder.recordings}
            onDownload={recorder.downloadRecording}
            onDelete={recorder.deleteRecording}
          />
        </RecorderCard>
      </main>
    </>
  );
};

export default App;
