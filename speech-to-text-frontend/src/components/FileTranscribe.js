import React, { useState } from "react";
import { speechAPI } from "../services/api";
import "./OptionComponent.css";
import DownloadButton from "./DownloadButton";

function FileTranscribe() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en-US");
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscription("");
    setError(null);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError("Please select an audio file.");
      return;
    }
    setLoading(true);
    setTranscription("");
    setError(null);
    try {
      const res = await speechAPI.transcribeFile(file, language);
      if (res.success) {
        setTranscription(res.transcription);
      } else {
        setError(res.error || "Transcription failed.");
      }
    } catch (e) {
      setError("API call failed.");
    }
    setLoading(false);
  };

  return (
    <div className="option-box glass"  style={{ position: "relative" }}>
        <DownloadButton transcription={transcription} disabled={!transcription} />
    
      <h2>File Transcription</h2>
      <div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="file-lang-select">Language:</label>
        <select
          id="file-lang-select"
          value={language}
          onChange={handleLanguageChange}
          disabled={loading}
        >
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (India)</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <button onClick={handleTranscribe} disabled={loading || !file}>
        {loading ? "Transcribing..." : "Transcribe File"}
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

export default FileTranscribe;