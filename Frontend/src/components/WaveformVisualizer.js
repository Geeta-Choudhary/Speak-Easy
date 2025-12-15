import React from "react";
import { motion } from "framer-motion";
import "./WaveformVisualizer.css";

function WaveformVisualizer() {
  return (
    <div className="waveform-container">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="waveform-bar"
          animate={{ height: [10, 40, 10] }}
          transition={{
            repeat: Infinity,
            duration: 1 + Math.random(),
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default WaveformVisualizer;