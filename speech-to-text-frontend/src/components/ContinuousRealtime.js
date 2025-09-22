import React, { useState } from "react";
import { recordAudio } from "../utils/audioRecorder";
import WaveformVisualizer from "./WaveformVisualizer";
import "./OptionComponent.css";
import DownloadButton from "./DownloadButton";

async function transcribeWithFileApi(audioBlob, language) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");
  formData.append("language", language);
  const response = await fetch("https://voice-transcribe-api.azurewebsites.net/api/file-transcription", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Transcription failed");
  const data = await response.json();
  return data;
}

function ContinuousRealtime() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(60);

  const durations = [
    { label: "15 seconds", value: 15 },
    { label: "30 seconds", value: 30 },
    { label: "1 minute", value: 60 },
    { label: "2 minutes", value: 120 },
    { label: "3 minutes", value: 180 },
  ];

  const handleRecord = async () => {
    setRecording(true);
    setTranscription("");
    setError(null);
    try {
      const audioBlob = await recordAudio(duration);
      const res = await transcribeWithFileApi(audioBlob, "en-US");
      if (res.success) {
        setTranscription(res.transcription);
      } else {
        setError(res.error || "Transcription failed.");
      }
    } catch (e) {
      setError("API call failed.");
    }
    setRecording(false);
  };

  return (
    <div className="option-box glass"  style={{ position: "relative" }}>
        <DownloadButton transcription={transcription} disabled={!transcription} />
    
      <h2>Continuous Real-Time (auto transcription)</h2>
      <div className="duration-select-row">
        <label htmlFor="duration-select-continuous">Recording Time:</label>
        <select
          id="duration-select-continuous"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {durations.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleRecord} disabled={recording}>
        {recording ? "Recording..." : `Start Recording (${duration}s)`}
      </button>
      {recording && <WaveformVisualizer />}
      {error && (
        <div className="transcription-box" style={{ color: "#ff6b6b" }}>
          <strong>❌ {error}</strong>
        </div>
      )}
      <div className="transcription-box">
        <strong>Live Transcription:</strong> {transcription}
      </div>
    </div>
  );
}

export default ContinuousRealtime;