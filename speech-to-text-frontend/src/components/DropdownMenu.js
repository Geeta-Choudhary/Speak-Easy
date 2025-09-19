import React, { useState } from "react";
import MicTest from "./MicTest";
import SimpleRealtime from "./SimpleRealtime";
import ContinuousRealtime from "./ContinuousRealtime";
import HindiTranscription from "./HindiTranscription";
import FileTranscribe from "./FileTranscribe";
import "./DropdownMenu.css";

const options = [
  { label: "Test Connection & Mic", value: "mic" },
  { label: "Simple Real-Time (wait by duration)", value: "simple" },
  { label: "Continuous Real-Time (auto transcription)", value: "continuous" },
  { label: "Hindi-Language Support Transcription", value: "hindi" },
  { label: "File Transcribe", value: "file" },
];

function DropdownMenu() {
  const [selected, setSelected] = useState("mic");
  const [showTooltip, setShowTooltip] = useState(false);

  let OptionComponent;
  switch (selected) {
    case "mic":
      OptionComponent = <MicTest />;
      break;
    case "simple":
      OptionComponent = <SimpleRealtime />;
      break;
    case "continuous":
      OptionComponent = <ContinuousRealtime />;
      break;
    case "hindi":
      OptionComponent = <HindiTranscription />;
      break;
    case "file":
      OptionComponent = <FileTranscribe />;
      break;
    default:
      OptionComponent = null;
  }

  return (
    <section className="options-section">
      <div
        className="dropdown"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="dropdown-select"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {showTooltip && (
          <div className="dropdown-tooltip">
            You can view the other options here
          </div>
        )}
      </div>
      <div className="option-component">{OptionComponent}</div>
    </section>
  );
}

export default DropdownMenu;