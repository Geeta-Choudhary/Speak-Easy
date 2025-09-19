import React from "react";
import { motion } from "framer-motion";
import "./HomePage.css";

function HomePage({ onArrowClick }) {
  return (
    <section className="homepage">
      {/* Animated SVG Blobs */}
      <motion.svg
        className="blob1"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      >
        <motion.path
          fill="#4f8cff"
          d="M44.8,-67.7C56.7,-59.6,63.7,-44.2,68.1,-29.2C72.5,-14.2,74.2,0.5,70.2,13.7C66.2,26.9,56.5,38.6,44.7,47.7C32.9,56.8,18.9,63.3,3.5,62.1C-11.9,60.9,-23.8,52,-36.2,43.2C-48.6,34.4,-61.5,25.7,-67.1,13.1C-72.7,0.5,-71.1,-15.9,-63.9,-29.2C-56.7,-42.5,-43.9,-52.7,-30.2,-60.3C-16.5,-67.9,-2,-72.9,13.2,-77.1C28.4,-81.3,56.7,-75.8,44.8,-67.7Z"
          transform="translate(100 100)"
          animate={{
            d: [
              "M44.8,-67.7C56.7,-59.6,63.7,-44.2,68.1,-29.2C72.5,-14.2,74.2,0.5,70.2,13.7C66.2,26.9,56.5,38.6,44.7,47.7C32.9,56.8,18.9,63.3,3.5,62.1C-11.9,60.9,-23.8,52,-36.2,43.2C-48.6,34.4,-61.5,25.7,-67.1,13.1C-72.7,0.5,-71.1,-15.9,-63.9,-29.2C-56.7,-42.5,-43.9,-52.7,-30.2,-60.3C-16.5,-67.9,-2,-72.9,13.2,-77.1C28.4,-81.3,56.7,-75.8,44.8,-67.7Z",
              "M53.6,-68.7C67.6,-59.2,75.7,-39.2,73.2,-21.6C70.7,-4,57.6,11.2,46.6,25.5C35.6,39.8,26.7,53.2,13.2,60.7C-0.3,68.2,-18.5,69.8,-32.2,62.2C-45.9,54.6,-55.1,37.7,-61.2,21.2C-67.3,4.7,-70.3,-11.4,-65.2,-25.2C-60.1,-39,-46.9,-50.5,-32.2,-59.2C-17.5,-67.9,-1.3,-73.7,15.1,-76.2C31.5,-78.7,63.6,-78.2,53.6,-68.7Z",
              "M44.8,-67.7C56.7,-59.6,63.7,-44.2,68.1,-29.2C72.5,-14.2,74.2,0.5,70.2,13.7C66.2,26.9,56.5,38.6,44.7,47.7C32.9,56.8,18.9,63.3,3.5,62.1C-11.9,60.9,-23.8,52,-36.2,43.2C-48.6,34.4,-61.5,25.7,-67.1,13.1C-72.7,0.5,-71.1,-15.9,-63.9,-29.2C-56.7,-42.5,-43.9,-52.7,-30.2,-60.3C-16.5,-67.9,-2,-72.9,13.2,-77.1C28.4,-81.3,56.7,-75.8,44.8,-67.7Z"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
      {/* Floating Particles */}
      <div className="particles">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.5,
              scale: 0.5 + Math.random() * 0.8,
            }}
            animate={{
              y: [0, -30 + Math.random() * 60, 0],
              x: [0, -20 + Math.random() * 40, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 8 + Math.random() * 8,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* Animated Soundwave Bars */}
      <div className="soundwave-bg">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="wave-bar"
            animate={{ height: [10, 60, 10] }}
            transition={{
              repeat: Infinity,
              duration: 1 + Math.random(),
              delay: i * 0.07,
              ease: "easeInOut",
            }}
            style={{ left: `${i * 3.5}%` }}
          />
        ))}
      </div>
      <div className="homepage-content glass">
        <h1>Speech-to-Text Conversion</h1>
        <p className="subtitle">Convert your voice into accurate text instantly</p>
        <motion.div
          className="down-arrow glow"
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={onArrowClick}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M12 5v14m0 0l-7-7m7 7l7-7"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

export default HomePage;