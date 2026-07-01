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
      <RecorderCard>
        <RecordingOptions
          qualityPresetId={recorder.qualityPresetId}
          mimeType={recorder.mimeType}
          includeAudio={recorder.includeAudio}
          supportedMimeTypes={recorder.supportedMimeTypes}
          disabled={optionsDisabled}
          onQualityPresetChange={recorder.setQualityPresetId}
          onMimeTypeChange={recorder.setMimeType}
          onIncludeAudioChange={recorder.setIncludeAudio}
        />

        <PreviewPanel
          previewStream={recorder.previewStream}
          isRecording={recorder.isRecording}
          timerFormatted={recorder.timerFormatted}
        />

        <CaptureInfo info={recorder.isRecording ? recorder.captureInfo : null} />

        <RecordingControls
          canStart={recorder.canStart}
          canStop={recorder.canStop}
          canDownloadLatest={recorder.canDownloadLatest}
          onStart={() => void recorder.startRecording()}
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
    </>
  );
};

export default App;
