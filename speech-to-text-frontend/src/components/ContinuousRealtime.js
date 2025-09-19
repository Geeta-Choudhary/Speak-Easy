import React, { useState, useRef, useEffect } from "react";
import { speechAPI } from "../services/api";
import WaveformVisualizer from "./WaveformVisualizer";
import "./OptionComponent.css";
import DownloadButton from "./DownloadButton";

function ContinuousRealtime() {
  const [recording, setRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleStart = async () => {
    setRecording(true);
    setTranscription("");
    setError(null);
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);

    try {
      const res = await speechAPI.startContinuousTranscription("en-US", newSessionId);
      if (res.success) {
        // Start polling for results every 3 seconds
        pollingRef.current = setInterval(async () => {
          try {
            const result = await speechAPI.getContinuousResults(newSessionId);
            if (result.success) {
              setTranscription(result.transcription);
              if (!result.is_active) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setRecording(false);
              }
            } else {
              setError(result.error || "Polling failed.");
              clearInterval(pollingRef.current);
              pollingRef.current = null;
              setRecording(false);
            }
          } catch (e) {
            setError("Polling error.");
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setRecording(false);
          }
        }, 3000);
      } else {
        setError(res.error || "Failed to start session.");
        setRecording(false);
      }
    } catch (e) {
      setError("API call failed.");
      setRecording(false);
    }
  };

  const handleStop = async () => {
    setRecording(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (!sessionId) return;
    try {
      const res = await speechAPI.stopContinuousTranscription(sessionId);
      if (res.success) {
        setTranscription(res.transcription);
      } else {
        setError(res.error || "Failed to stop session.");
      }
    } catch (e) {
      setError("API call failed.");
    }
    setSessionId(null);
  };

  return (
    <div className="option-box glass"  style={{ position: "relative" }}>
        <DownloadButton transcription={transcription} disabled={!transcription} />
    
      <h2>Continuous Real-Time (auto transcription)</h2>
      <button onClick={handleStart} disabled={recording}>
        Start Recording
      </button>
      <button onClick={handleStop} disabled={!recording}>
        Stop Recording
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