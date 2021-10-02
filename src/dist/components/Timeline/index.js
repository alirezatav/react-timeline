"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = Timeline;

var _react = _interopRequireWildcard(require("react"));

var _T = _interopRequireDefault(require("./T.js"));

require("./index.css");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function Timeline(props) {
  let timeLine;
  let shift;
  let zoomLevel;
  let data;
  let beginingTimeShow;
  let endTimeShow;
  const canvas1 = (0, _react.useRef)(null);
  const canvasAudio = (0, _react.useRef)(null);
  const canvas2 = (0, _react.useRef)(null);

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
    timeLine = (0, _T.default)(
      canvas1.current,
      canvas2.current,
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

  (0, _react.useEffect)(() => {
    let endTime;

    if (props.data.length > 0 && props.src) {
      endTime =
        canvasAudio.current.duration || props.data[props.data.length - 1]
          ? props.data[props.data.length - 1].end
          : 3600;

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
  return /*#__PURE__*/ _react.default.createElement(
    "div",
    {
      style: style,
      className: "timeline-editor",
    },
    /*#__PURE__*/ _react.default.createElement(
      "div",
      {
        hidden: true,
      },
      /*#__PURE__*/ _react.default.createElement("audio", {
        src: props.src,
        ref: canvasAudio,
      })
    ),
    /*#__PURE__*/ _react.default.createElement(
      "div",
      {
        className: "wrap z-index-2",
      },
      /*#__PURE__*/ _react.default.createElement("canvas", {
        ref: canvas1,
      })
    ),
    /*#__PURE__*/ _react.default.createElement(
      "div",
      {
        className: "wrap z-index-1",
      },
      /*#__PURE__*/ _react.default.createElement("canvas", {
        ref: canvas2,
      })
    )
  );
}
