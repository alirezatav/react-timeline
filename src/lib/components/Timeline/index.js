import React, { useEffect, useRef } from "react";
import TimeLine from "./T.js";
import "./index.css";
export default function Timeline(props) {
  let timeLine;
  let shift;
  let zoomLevel;
  let data;
  let beginingTimeShow;
  let endTimeShow;

  const canvas1 = useRef(null);
  const canvasAudio = useRef(null);
  const canvas2 = useRef(null);

  const changeAlignment = (z) => {
    data = z;
    props.setAligns(z);
  };
  const changeZoomLevel = (z) => {
    props.changeZoomLevel(z);
    zoomLevel = z;
  };
  const changeShift = (s) => {
    props.changeShift(s);
    shift = s;
  };

  const changeAreaShow = (b, e) => {
    props.changeAreaShow(b, e);
    beginingTimeShow = b;
    endTimeShow = e;
  };

  const drawTimeLine = (p) => {
    timeLine = TimeLine(
      canvas1?.current,
      canvas2?.current,
      p.data,
      p.endTime,
      () => canvasAudio.current,
      props.paddingRight,
      changeAlignment,
      changeZoomLevel,
      changeShift,
      changeAreaShow
    );
  };

  useEffect(() => {
    let endTime;
    if (props.data.length > 0 && props.src) {
      endTime =
        canvasAudio.current?.duration ||
        props.data[props.data.length - 1]?.end ||
        3600;
      if (props.data[props.data.length - 1].end > endTime) {
        endTime = props.data[props.data.length - 1].end;
        console.log("Video time is less than the alignments end time");
      }

      drawTimeLine({ ...props, endTime });
    }

    return () => {
      if (timeLine) timeLine.cancelAnimate();
    };
  }, [props.data, props.src]);

  const style = {
    height: "90px",
    paddingLeft: props.paddingLeft,
  };
  return (
    <div style={style} className="timeline-editor">
      <div hidden>
        <audio src={props.src} ref={canvasAudio} />
      </div>
      <div className="wrap z-index-2">
        <canvas ref={canvas1}></canvas>
      </div>
      <div className="wrap z-index-1">
        <canvas ref={canvas2}></canvas>
      </div>
    </div>
  );
}
