import React, { useState } from "react";
import { simpleRealtimeTranscribe } from "../services/api";
import "./OptionComponent.css";
import DownloadButton from "./DownloadButton";

const durations = [
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "3 minutes", value: 180 },
];

function SimpleRealtime() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState(null);

  const handleRecord = async () => {
    setRecording(true);
    setTranscription("");
   setError(null);
    try {
      const res = await simpleRealtimeTranscribe(duration, "en-US");
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
    <div className="option-box glass" style={{ position: "relative" }}>
        <DownloadButton transcription={transcription} disabled={!transcription} />
    
      <h2>Simple Real-Time (wait by duration)</h2>
      <div className="duration-select-row">
        <label htmlFor="duration-select">Recording Time:</label>
        <select
          id="duration-select"
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
      {error && (
        <div className="transcription-box" style={{ color: "#ff6b6b" }}>
          <strong>❌ {error}</strong>
        </div>
      )}
      {transcription && (
        <div className="transcription-box">
          <strong>Transcription:</strong> {transcription}
        </div>
      )}
    </div>
    
  );
 
}

export default SimpleRealtime;