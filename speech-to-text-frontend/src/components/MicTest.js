import React, { useState } from "react";
import { speechAPI } from "../services/api";
import WaveformVisualizer from "./WaveformVisualizer";
import "./OptionComponent.css";

function MicTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(5);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    setError(null);
    try {
      const res = await speechAPI.testConnection(duration);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.error || "Test failed.");
      }
    } catch (e) {
      setError("API call failed.");
    }
    setTesting(false);
  };

  return (
    <div className="option-box glass">
      <h2>Test Connection & Mic</h2>
      <div>
        <label htmlFor="mic-duration">Duration (seconds):</label>
        <input
          id="mic-duration"
          type="number"
          min={1}
          max={30}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={testing}
        />
      </div>
      <button onClick={handleTest} disabled={testing}>
        {testing ? "Testing..." : "Test Microphone"}
      </button>
      {testing && <WaveformVisualizer />}
      {error && (
        <div className="transcription-box" style={{ color: "#ff6b6b" }}>
          <strong>❌ {error}</strong>
        </div>
      )}
      {result && (
        <div className="transcription-box">
          <strong>✅ {result.message}</strong>
          <br />
          <b>Connection:</b> {result.connection_status}
          <br />
          <b>Microphone:</b> {result.microphone_status}
          <br />
          <b>Transcription:</b> {result.transcription}
        </div>
      )}
    </div>
  );
}

export default MicTest;