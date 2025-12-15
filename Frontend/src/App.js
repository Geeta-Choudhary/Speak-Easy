import React, { useRef } from "react";
import HomePage from "./components/HomePage";
import DropdownMenu from "./components/DropdownMenu";
import "./App.css";

function App() {
  const optionsRef = useRef(null);

  const scrollToOptions = () => {
    optionsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <HomePage onArrowClick={scrollToOptions} />
      <div ref={optionsRef}>
        <DropdownMenu />
      </div>
    </div>
  );
}

export default App;