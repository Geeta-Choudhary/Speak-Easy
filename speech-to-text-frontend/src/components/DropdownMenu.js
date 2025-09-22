import React, { useState } from "react";
import MicTest from "./MicTest";
import SimpleRealtime from "./SimpleRealtime";
import HindiTranscription from "./HindiTranscription";
import FileTranscribe from "./FileTranscribe";
import "./DropdownMenu.css";

const options = [
  { label: "Quick Mic Test 🎤", value: "mic" },
  { label: "English Voice to Text ✨", value: "simple" },
  { label: "Hindi Voice to Text 🌏", value: "hindi" },
  { label: "Upload Audio File 📁", value: "file" },
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
      <div className="dropdown-container">
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
              Choose your transcription mode
            </div>
          )}
        </div>
      </div>
      <div className="option-component">{OptionComponent}</div>
    </section>
  );
}

export default DropdownMenu;