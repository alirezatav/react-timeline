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

  let defaultFunction = () => {};

  const drawTimeLine = (p) => {
    var _props$colors,
      _props$colors2,
      _props$colors3,
      _props$colors4,
      _props$colors5,
      _props$colors6,
      _props$colors7,
      _props$colors8,
      _props$colors9,
      _props$colors10,
      _props$colors11,
      _props$colors12;

    timeLine = (0, _T.default)(
      canvas1.current,
      canvas2.current,
      p.data,
      p.endTime,
      () => (props.audioRef ? props.audioRef.current : canvasAudio.current),
      changeAlignment || defaultFunction,
      changeZoomLevel || defaultFunction,
      changeShift || defaultFunction,
      changeAreaShow || defaultFunction,
      {
        autoScroll: props.autoScroll,
        colors: {
          background:
            ((_props$colors = props.colors) === null || _props$colors === void 0
              ? void 0
              : _props$colors.background) || "transparent",
          box:
            ((_props$colors2 = props.colors) === null ||
            _props$colors2 === void 0
              ? void 0
              : _props$colors2.box) || "#a9a9a9",
          boxHover:
            ((_props$colors3 = props.colors) === null ||
            _props$colors3 === void 0
              ? void 0
              : _props$colors3.boxHover) || "#80add6",
          selectedBox:
            ((_props$colors4 = props.colors) === null ||
            _props$colors4 === void 0
              ? void 0
              : _props$colors4.selectedBox) || "#1890ff",
          playingBox:
            ((_props$colors5 = props.colors) === null ||
            _props$colors5 === void 0
              ? void 0
              : _props$colors5.playingBox) || "#f0523f",
          text:
            ((_props$colors6 = props.colors) === null ||
            _props$colors6 === void 0
              ? void 0
              : _props$colors6.text) || "#212b33",
          selectedText:
            ((_props$colors7 = props.colors) === null ||
            _props$colors7 === void 0
              ? void 0
              : _props$colors7.selectedText) || "white",
          tooltipBackground:
            ((_props$colors8 = props.colors) === null ||
            _props$colors8 === void 0
              ? void 0
              : _props$colors8.tooltipBackground) || "#474e54",
          tooltipText:
            ((_props$colors9 = props.colors) === null ||
            _props$colors9 === void 0
              ? void 0
              : _props$colors9.tooltipText) || "white",
          scrollBarBackground:
            ((_props$colors10 = props.colors) === null ||
            _props$colors10 === void 0
              ? void 0
              : _props$colors10.scrollBarBackground) || "#f1f3f9",
          scrollBar:
            ((_props$colors11 = props.colors) === null ||
            _props$colors11 === void 0
              ? void 0
              : _props$colors11.scrollBar) || "#c2c9d6",
          scrollBarHover:
            ((_props$colors12 = props.colors) === null ||
            _props$colors12 === void 0
              ? void 0
              : _props$colors12.scrollBarHover) || "#8f96a3",
        },
      }
    );
  };

  (0, _react.useEffect)(() => {
    let endTime;

    if (props.data.length > 0 && props.src) {
      endTime = props.data[props.data.length - 1]
        ? props.data[props.data.length - 1].end * 1.2
        : 60;

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
        ref: props.audioRef || canvasAudio,
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
