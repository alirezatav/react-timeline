import Timeline from "./lib/components";
import React, { useEffect, useRef } from "react";
function App() {
  const data = [
    { begin: 1, end: 3, text: "This is subtitle" },
    { begin: 20, end: 45, text: "This is subtitle" },
  ];
  const audioRef = useRef(null);
  const setAligns = () => {};
  const changeAreaShow = () => {};
  const changeShift = () => {};
  const changeZoomLevel = () => {};
  return (
    <div style={{ padding: "50px" }}>
      <Timeline
        changeAreaShow={changeAreaShow}
        changeZoomLevel={changeZoomLevel}
        changeShift={changeShift}
        setAligns={setAligns}
        audioRef={audioRef}
        src={
          "https://dls.music-fa.com/tagdl/99/Behnam%20Safavi%20-%20Name%20Eshgh%20(128).mp3"
        }
        data={data}
        colors={{
          background: "transparent",
          box: "#a9a9a9",
          boxHover: "#80add6",
          selectedBox: "#f1b12feb",
          playingBox: "#f0523f",
          text: "#212b33",
          selectedText: "white",
          tooltipBackground: "#474e54",
          tooltipText: "white",
          scrollBarBackground: "#f1f3f9",
          scrollBar: "#c2c9d6",
          scrollBarHover: "#5e636e",
        }}
      />{" "}
    </div>
  );
}

export default App;
