import React from "react";
import { speechAPI } from "../services/api";

function DownloadIconButton({ transcription, disabled }) {
  const handleDownload = async () => {
    if (!transcription) return;
    try {
      const res = await speechAPI.downloadTranscription(transcription);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcription.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed.");
    }
  };

  return (
    <svg
      onClick={!disabled ? handleDownload : undefined}
      role="button"
      tabIndex={0}
      aria-label="Download Transcription"
      width="32"
      height="32"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      className={`download-icon ${disabled ? "disabled" : ""}`}
    >
      <path
        d="M11 3V15M11 15L6 10M11 15L16 10M4 19H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DownloadIconButton;
