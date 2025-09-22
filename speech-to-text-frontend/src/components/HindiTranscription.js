import React, { useState } from "react";
import { recordAudio } from "../utils/audioRecorder";
import "./OptionComponent.css";
import DownloadButton from "./DownloadButton";

const durations = [
  { label: "5 seconds", value: 5 },
  { label: "10 seconds", value: 10 },
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "3 minutes", value: 180 },
];

async function transcribeWithFileApi(audioBlob, language) {
  const file = new File([audioBlob], "audio.wav", { type: "audio/wav" });
  const formData = new FormData();
  formData.append("audio", file, "audio.wav");
  formData.append("language", language);
  const response = await fetch("https://voice-transcribe-api.azurewebsites.net/api/file-transcription", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Transcription failed");
  const data = await response.json();
  return data;
}

function HindiTranscription() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [duration, setDuration] = useState(5);
  const [error, setError] = useState(null);
  const [recordingDone, setRecordingDone] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleRecord = async () => {
    setRecording(true);
    setTranscription("");
    setError(null);
    setRecordingDone(false);
    setTranscribing(false);
    setAudioBlob(null);
    try {
      const blob = await recordAudio(duration);
      setAudioBlob(blob);
      setRecording(false);
      setRecordingDone(true);
      setTranscribing(true);
      const res = await transcribeWithFileApi(blob, "hi-IN");
      setTranscribing(false);
      if (res.success) {
        setTranscription(res.transcription);
      } else {
        setError(res.error || "माफ़ कीजिए, हम इसे कन्वर्ट नहीं कर पाए। कृपया दोबारा कोशिश करें।");
      }
    } catch (e) {
      setRecording(false);
      setTranscribing(false);
      setError("कृपया अपना माइक्रोफ़ोन चेक करें और दोबारा कोशिश करें।");
    }
  };

  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hindi_recording.wav";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="option-box glass" style={{ position: "relative" }}>
      <DownloadButton transcription={transcription} disabled={!transcription} />
      
      <h2>हिंदी में बोलें (Speak in Hindi)</h2>
      <p className="subtitle">Convert your Hindi speech to text in real-time</p>
      
      <div className="duration-select-row">
        <label htmlFor="duration-select-hindi">Recording Duration:</label>
        <select
          id="duration-select-hindi"
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

      <button onClick={handleRecord} disabled={recording} className="primary-button">
        {recording ? "रिकॉर्डिंग... 🎤" : `${duration}s की रिकॉर्डिंग शुरू करें 🎤`}
      </button>
      
      {audioBlob && (
        <button onClick={handleDownloadAudio} className="secondary-button">
          रिकॉर्डिंग डाउनलोड करें 💾
        </button>
      )}

      {recordingDone && (
        <div className="status-message success">
          <span>✓</span> रिकॉर्डिंग पूरी हुई
        </div>
      )}
      
      {transcribing && (
        <div className="status-message info">
          <div className="processing-indicator"></div>
          आवाज़ को टेक्स्ट में बदल रहे हैं...
        </div>
      )}
      
      {error && (
        <div className="status-message error">
          <span>⚠️</span> {error}
        </div>
      )}
      
      {transcription && (
        <div className="transcription-box">
          <div className="transcription-header">आपका टेक्स्ट</div>
          <div className="transcription-content">{transcription}</div>
        </div>
      )}
    </div>
  );
}

export default HindiTranscription;