"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = TimeLine;
exports.toFixed2 = void 0;

const toFixed2 = (i) => parseInt(i * 100) / 100;

exports.toFixed2 = toFixed2;

function TimeLine(
  canvas,
  canvas2,
  alignments,
  endTime,
  getPlayer,
  paddingRight,
  changeAlignment,
  changeZoomLevel,
  changeShift,
  tellAreaChangesToRectComponent
) {
  // constants
  const LINE_HEIGHT = 40;
  const TRACK_HEIGHT = 40;
  const TIME_BAR_MARGIN = 17;
  const TIMELINE_HEIGHT = 90;
  const RESIZE_MODE_EDGE = 5;
  const SHIFT_SCALE = 4;
  const EXRTA_SHIFT = 60;
  const PADDING_RIGHT = paddingRight || 0;
  const ZOOM_SCALE = 1.35;
  const MINIMUM_BLOCK_TIME = 1;
  const SCROLL_BAR_HEIGHT = 10; // colors

  const SELECTED_COLOR = "#1890ff";
  const ACTIVE_COLOR = "#7c9abd";
  const CURSOR_ON_BOX_COLOR = "#80add6";
  const CURSUR_TIME_CONTAINER_COLOR = "#f0523f";
  let scrolling = false;
  let autoScroll = localStorage.autoScroll === "true";
  let renderingPrtcls = [];
  let maximumShift = 10000;
  let isMouseDown = false;

  if (!canvas || !canvas2 || !alignments) {
    return;
  } // element setting

  let animationID;
  let w = (canvas.width = canvas2.width = window.innerWidth - PADDING_RIGHT);
  let h = (canvas.height = canvas2.height = TIMELINE_HEIGHT);
  let scrollPosition = 0;
  let scrollSize = w;
  let minimumZoomLevel = w / endTime;
  let ctx = canvas.getContext("2d");
  let bgCtx = canvas2.getContext("2d");
  ctx.lineWidth = 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "10px Arial";
  canvas.style.backgroundColor = "transparent";
  canvas2.style.backgroundColor = "transparent";
  let mouse = {};
  let lastXcursor = 0;
  let mouseTime;
  let swaping = false;
  let player;
  let shift = 0;
  let movingDirection;
  let zoomLevel = w / endTime || 1;
  let moving = false;
  let resizing = false;
  let currentPrtcl;
  let currentHoveredIndex = -1;
  let currentPrtclsIndex;
  let rightResize = false;
  let leftResize = false;
  let globalRatio = 1;
  let currentTime = 0;
  let beginingTimeShow = 0;
  let endTimeShow = Math.abs(w + shift) / zoomLevel;
  let moveIndex;
  let newTime;
  let prtcls = [];
  setData(alignments); //tooltip

  var tooltipTimeout;
  var visibleTooltip = false;
  let visitedPrtcl; // BEGIN ...

  addListenerHandlers(canvas);
  changeZoomLevel(zoomLevel);
  tellAreaChangesToRectComponent(beginingTimeShow, endTimeShow);
  drawBG(bgCtx);
  animate(); // HELPERS ...

  function Square(x, y, edge, index, text, sIndex, eIndex) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.edge = edge;
    this.startIndex = sIndex;
    this.endIndex = eIndex;
    this.selected = false;
    this.active = false;
    this.index = index;

    this.draw = (context) => {
      context.save();
      this.x = toFixed2(this.x);
      this.edge = toFixed2(this.edge); // background color

      var grd = ctx.createLinearGradient(
        this.x + shift,
        this.y,
        this.x + this.edge + shift,
        this.y
      );
      grd.addColorStop(0, "#a9a9a9");
      grd.addColorStop(1, "#bbbbbb");
      context.fillStyle = ACTIVE_COLOR;

      if (currentHoveredIndex === this.index) {
        context.fillStyle = CURSOR_ON_BOX_COLOR;
      } else {
        context.fillStyle = grd;
      }

      if (this.active) {
        context.fillStyle = ACTIVE_COLOR;
      }

      if (this.selected) {
        context.fillStyle = SELECTED_COLOR;
      }

      context.fillRect(this.x + shift, this.y, this.edge, TRACK_HEIGHT);
      context.beginPath();
      context.strokeStyle = "#888888";
      context.lineWidth = 1;
      context.moveTo(this.x + shift - 1 + this.edge, this.y + 1);
      context.lineTo(this.x + shift - 1 + this.edge, this.y + TRACK_HEIGHT);
      context.closePath();
      context.stroke();
      ctx.font = "13px Arial";
      context.fillStyle = "#212b33";
      if (this.selected) context.fillStyle = "white"; //High usage! fittingString()

      if (
        this.edge > 20 &&
        (currentHoveredIndex === this.index ||
          currentPrtclsIndex === this.index)
      )
        ctx.fillText(
          fittingString(ctx, this.text, this.edge),
          this.x + 1 + shift,
          this.y + 22
        );
      context.restore();
    };
  }

  function getMouseCoords(canvas, event) {
    let canvasCoords = canvas.getBoundingClientRect();
    let yy = event.pageY - canvas.offsetTop;
    let xx = event.pageX - canvas.offsetLeft;
    let xxxx = event.pageX - canvasCoords.x;
    let yyyy = event.pageY - canvasCoords.y - window.pageYOffset;
    return {
      x: xxxx,
      y: yyyy,
    };
  }

  function getOffsetCoords(mouse, rect) {
    return {
      x: mouse.x - rect.x,
      y: mouse.y - rect.y,
    };
  }

  function cursorInRect(mouseX, mouseY, rectX, rectY, rectW, rectH) {
    let xLine = mouseX > rectX + shift && mouseX < rectX + shift + rectW;
    let yLine = mouseY > rectY && mouseY < rectY + TRACK_HEIGHT;
    return xLine && yLine;
  }

  function resize() {
    w = canvas.width = canvas2.width = window.innerWidth - PADDING_RIGHT;
    h = canvas.height = canvas2.height = TIMELINE_HEIGHT;
  }

  function changeZoom(deltaY) {
    handleZoom({
      deltaY,
    });
  }

  function handleZoom(e) {
    try {
      e.preventDefault();
    } catch (error) {}

    if (resizing) return;
    let originalZoomLevel = zoomLevel;
    let originalMouseTime = mouseTime;
    let viewPortTime = endTimeShow - beginingTimeShow;

    if (e.deltaY < 0) {
      if (zoomLevel * ZOOM_SCALE < 500) zoomLevel *= ZOOM_SCALE;
    } else {
      if (zoomLevel / ZOOM_SCALE <= minimumZoomLevel) {
        zoomLevel = minimumZoomLevel;
      } else {
        if (viewPortTime < endTime) {
          zoomLevel /= ZOOM_SCALE;
        }
      }
    }

    let newMouseTime = (mouse.x - shift) / zoomLevel;
    let newShift = (originalMouseTime - newMouseTime) * zoomLevel;

    if (shift - newShift > 0) {
      shift = 0;
    } else {
      shift = shift - newShift;
    }

    let ratio = 1;
    prtcls.forEach((p) => {
      let px = p.x;
      let originalPX = p.x / originalZoomLevel;
      let originalEdge = p.edge / originalZoomLevel;
      p.edge = originalEdge * zoomLevel;
      p.x = originalPX * zoomLevel;
      ratio = p.x / px;
    });
    checkShift();
    changeZoomLevel(zoomLevel);
  }

  function drawTimeCursor() {
    let position = currentTime * zoomLevel + shift;
    let context = ctx;
    let pos = position !== undefined ? position : mouse ? mouse.x : undefined;
    if (pos === undefined) return;
    currentHoveredIndex = prtcls.findIndex(
      (e) => pos - shift >= e.x && pos - shift <= e.x + e.edge
    );
    context.save();
    context.fillStyle = CURSUR_TIME_CONTAINER_COLOR;
    context.fillRect(pos - 70, 21, 70, 17);
    context.fillStyle = "white";
    context.fillText(toTime((pos - shift) / zoomLevel, true), pos - 60, 30);
    context.lineWidth = 0.5;
    context.strokeStyle = CURSUR_TIME_CONTAINER_COLOR;
    context.beginPath();
    context.moveTo(pos, 0);
    context.lineTo(pos, 150);
    context.closePath();
    context.stroke();
    context.restore();
  }

  function activePrtcl() {
    if (scrolling) return;
    currentPrtclsIndex = prtcls.findIndex((e) =>
      cursorInRect(mouse.x, mouse.y, e.x, e.y, e.edge, e.edge)
    );
    moveIndex = currentPrtclsIndex;
    currentPrtcl = prtcls[currentPrtclsIndex];
    prtcls.forEach((d, i) => {
      if (currentPrtclsIndex !== i) {
        d.active = false;
      } else {
        d.active = true;
      }
    });
  }

  function mousemoveGeneral(e) {
    e.preventDefault();
    mouse = getMouseCoords(canvas, e);

    if (lastXcursor < mouse.x) {
      movingDirection = "right";
    } else {
      movingDirection = "left";
    }

    lastXcursor = mouse.x;

    if (!moving && !resizing & !swaping) {
      activePrtcl();
      checkResizing();
      hoverElement();
    }
  }

  function handleHoverTimeBar() {
    if (mouse.y < TIME_BAR_MARGIN) {
      canvas.classList.add("crosshair");
    } else {
      canvas.classList.remove("crosshair");
    }
  }

  function handleMouseMove(e) {
    e.preventDefault();
    let min = 0;
    let max = 99999999;
    let leftSub = prtcls[currentPrtclsIndex - 1];
    let rightSub = prtcls[currentPrtclsIndex + 1];
    if (leftSub) min = leftSub.x + leftSub.edge;
    if (rightSub) max = rightSub.x;
    handleHoverTimeBar();
    if (!currentPrtcl) visibleTooltip = false;

    if (currentPrtcl) {
      if (currentPrtcl.selected) {
        if (resizing) {
          handleResize(mouse);
        } else {
          if (isMouseDown) {
            moving = true;
            handlePauseInChanging();
            let pos = mouse.x - currentPrtcl.offset.x;

            if (pos + currentPrtcl.edge <= max && pos >= min) {
              currentPrtcl.x = pos;
              currentPrtcl.y = LINE_HEIGHT;
            } else {
              if (
                movingDirection === "right" &&
                pos > currentPrtcl.x + currentPrtcl.edge
              )
                currentPrtcl.x = max - currentPrtcl.edge;
              if (movingDirection === "left" && pos < currentPrtcl.x)
                currentPrtcl.x = min;
            }
          }
        }
      }
    } else if (swaping) {
      // handlePauseInChanging()
      resetActives();
      handleVerticalSwipe();
    } else if (scrolling) {
      let mouseDistancetToScroll = Math.abs(mouse.x - scrollPosition);
      let distance = scrollSize / 2;
      let ratio = (mouse.x - distance) / w;
      let value = -1 * ratio * endTime * zoomLevel;
      if (value <= 0) shift = value;
    } else {
      resetActives();
    }

    checkShift();
  }

  function resetActives() {
    prtcls.forEach((d) => {
      d.active = false;
    });
  }

  function outPrtcls() {
    let data = prtcls.map((p, i) => {
      let begin = toFixed2(p.x / zoomLevel);
      let end = toFixed2((p.x + p.edge) / zoomLevel);
      let text = p.text;

      if (prtcls[i + 1]) {
        let nextStart = toFixed2(prtcls[i + 1].x / zoomLevel);
        if (nextStart < end) end = nextStart;
      }

      return {
        begin,
        end,
        text,
      };
    });
    changeAlignment(data);
  }

  function handleVerticalSwipe() {
    if (swaping) {
      if (movingDirection === "left") {
        if ((w - shift) / zoomLevel > endTime + EXRTA_SHIFT) return;
        shift = shift - SHIFT_SCALE;
      } else if (movingDirection === "right") {
        if (shift + SHIFT_SCALE > 0) {
          shift = 0;
        } else {
          shift = shift + SHIFT_SCALE;
        }
      }
    }
  }

  function calculateViewPortTimes() {
    beginingTimeShow = Math.abs(shift) / zoomLevel;
    endTimeShow = Math.abs(w - shift) / zoomLevel;
    mouseTime = (mouse.x - shift) / zoomLevel;
    tellAreaChangesToRectComponent(beginingTimeShow, endTimeShow);
    changeShift(shift);
  }

  function handleDbClick() {
    if (currentPrtcl) {
      if (
        cursorInRect(
          mouse.x,
          mouse.y,
          currentPrtcl.x,
          currentPrtcl.y,
          currentPrtcl.edge,
          currentPrtcl.edge
        )
      ) {
        currentPrtcl.selected = true;
        currentPrtcl.offset = getOffsetCoords(mouse, currentPrtcl);
        player.currentTime = currentPrtcl.x / zoomLevel;
        player.play();
      } else {
        currentPrtcl.selected = false;
      }
    }
  }

  function handleCursor() {
    if (swaping) {
      canvas.classList.add("grabbing");
    } else {
      canvas.classList.remove("grabbing");
    }

    if (currentPrtcl) {
      canvas.classList.add("move");
    } else {
      canvas.classList.remove("move");
    }
  }

  function handleMouseDown() {
    isMouseDown = true;

    if (rightResize || leftResize) {
      resizing = true;
      handlePauseInChanging();
    }

    if (currentPrtcl) {
      if (
        cursorInRect(
          mouse.x,
          mouse.y,
          currentPrtcl.x,
          currentPrtcl.y,
          currentPrtcl.edge,
          currentPrtcl.edge
        )
      ) {
        currentPrtcl.selected = true;
        currentPrtcl.offset = getOffsetCoords(mouse, currentPrtcl);

        if (resizing) {
          handlePauseInChanging();
        }
      } else {
        currentPrtcl.selected = false;
      }
    } else if (!resizing) {
      // hande click to change player current time
      if (mouse.y < TIME_BAR_MARGIN) {
        player.currentTime = (mouse.x - shift) / zoomLevel;
      } else if (
        mouse.y > TIME_BAR_MARGIN &&
        mouse.y < TIMELINE_HEIGHT - SCROLL_BAR_HEIGHT
      ) {
        swaping = true;
      }
    }
  }

  function handlePauseInChanging() {
    if (player) {
      player.pause();
    }
  }

  function mouseup() {
    isMouseDown = false;
    canvas.classList.remove("col-resize");

    if (resizing) {
      // player.play();
    }

    if (moving) {
      // player.play();
    }

    resizing = false;
    moving = false;
    swaping = false;
    stopMove = false;
    prtcls.forEach((e) => (e.selected = false));
    if (currentPrtcl) currentPrtcl.active = true;
    outPrtcls();
  }

  function checkResizing() {
    if (currentPrtcl) {
      if (
        mouse.x >=
          currentPrtcl.x + shift + currentPrtcl.edge - RESIZE_MODE_EDGE &&
        mouse.x <= currentPrtcl.x + shift + currentPrtcl.edge
      ) {
        rightResize = true;
        canvas.classList.add("col-resize");
      } else if (
        mouse.x <= currentPrtcl.x + shift + RESIZE_MODE_EDGE &&
        mouse.x >= currentPrtcl.x + shift
      ) {
        leftResize = true;
        canvas.classList.add("col-resize");
      } else {
        leftResize = false;
        rightResize = false;
        canvas.classList.remove("col-resize");
      }
    } else {
      leftResize = false;
      rightResize = false;
      canvas.classList.remove("col-resize");
    }
  }

  function setTooltipTimeout() {
    visibleTooltip = true;
    visitedPrtcl = -1;
  }

  function hoverElement() {
    if (currentPrtclsIndex > -1) {
      if (visitedPrtcl === -1) {
        visibleTooltip = false;
        clearTimeout(tooltipTimeout);
        visitedPrtcl = currentPrtclsIndex;
        tooltipTimeout = setTimeout(setTooltipTimeout, 700);
      }

      canvas.classList.add("move");
    } else {
      visibleTooltip = false;
      clearTimeout(tooltipTimeout);
      visitedPrtcl = -1;
      canvas.classList.remove("move");
    }
  }

  let stopMove = false;

  function handleResize(mouse) {
    let mousePosition = mouse.x - shift;
    let min = 0;
    let max = 99999999;
    handlePauseInChanging();
    let leftSub = prtcls[moveIndex - 1];
    let rightSub = prtcls[moveIndex + 1];
    if (leftSub) min = leftSub.x + leftSub.edge + shift;
    if (rightSub) max = rightSub.x + shift;

    if (currentPrtcl.selected) {
      if (rightResize) {
        let distanceToBegin = mouse.x - currentPrtcl.x - shift;

        if (
          mouse.x <= max &&
          mouse.x > currentPrtcl.x + MINIMUM_BLOCK_TIME + shift
        ) {
          currentPrtcl.edge = distanceToBegin;
        } else if (mouse.x > max) {
          let innersubs = prtcls.filter(
            (p) => p.x > currentPrtcl.x && p.x + p.edge < mousePosition
          );
          if (innersubs.length > 1) return;
          currentPrtcl.edge = distanceToBegin;
          newTime = currentPrtcl.x + currentPrtcl.edge;
          let inners = prtcls.filter((p) => p.x > currentPrtcl.x);
          inners.forEach((inner) => {
            if (inner.x < newTime) {
              if (inner.edge > MINIMUM_BLOCK_TIME * zoomLevel) {
                let endPoint = inner.x + inner.edge;
                inner.x = newTime;
                inner.edge = endPoint - inner.x;
              } else {
                inner.x = newTime;
              }
            } else {
              // if (inner.x < newTime) {
              //   inner.x = newTime;
              // }
            }

            newTime = inner.x + inner.edge;
          });
        }
      } else {
        let endPoint = currentPrtcl.x + currentPrtcl.edge;

        if (
          mouse.x > min &&
          mouse.x < currentPrtcl.x + currentPrtcl.edge - 0.3 + shift
        ) {
          currentPrtcl.x = mouse.x - shift;
          currentPrtcl.edge = endPoint - mouse.x + shift;
        } else if (mouse.x < min) {
          if (stopMove) return;
          let innersubs = prtcls.filter(
            (p) => p.x + p.edge > mousePosition && p.x < currentPrtcl.x
          );
          if (innersubs.length > 1) return;
          let inners = prtcls.filter((p) => p.x < mouse.x - shift);
          newTime = mouse.x - shift;

          for (let i = inners.length - 1; i >= 0; i--) {
            if (inners[i].x + inners[i].edge > newTime) {
              if (inners[i].edge > MINIMUM_BLOCK_TIME * zoomLevel) {
                currentPrtcl.x = mouse.x - shift;
                currentPrtcl.edge = endPoint - mouse.x + shift;
                inners[i].edge = newTime - inners[i].x;
              } else {
                if (newTime - inners[i].edge < 0) {
                  stopMove = true;
                } else {
                  currentPrtcl.x = mouse.x - shift;
                  currentPrtcl.edge = endPoint - mouse.x + shift;
                  inners[i].x = newTime - inners[i].edge;
                  newTime = inners[i].x;
                }
              }
            }
          }
        }
      }
    }
  }

  function toTime(s, withMilliSecond) {
    try {
      if (withMilliSecond)
        return new Date(s * 1000).toISOString().substr(11, 11);
      return new Date(s * 1000).toISOString().substr(11, 8);
    } catch (error) {
      return "";
    }
  }

  function setData(aligns) {
    prtcls = aligns.map(
      (p, i) =>
        new Square(
          p.begin * zoomLevel,
          LINE_HEIGHT,
          (p.end - p.begin) * zoomLevel,
          i,
          p.text,
          p.startIndex,
          p.endIndex
        )
    );
    return prtcls;
  }

  function fittingString(c, str, maxWidth) {
    var ellipsis = "…";
    if (maxWidth < 10) ellipsis = "";
    if (maxWidth < 5) return "";
    var width = c.measureText(str).width;
    var ellipsisWidth = c.measureText(ellipsis).width;

    if (width <= maxWidth || width <= ellipsisWidth) {
      return str;
    } else {
      if (!str) return;
      var len = str.length;

      while (width >= maxWidth - ellipsisWidth && len-- > 0) {
        str = str.substring(0, len);
        width = c.measureText(str).width;
      }

      return str + ellipsis;
    }
  }

  function showTooltip() {
    if (currentPrtcl) {
      ctx.save();
      ctx.translate(mouse.x + 10, mouse.y - 10);
      ctx.fillStyle = "#474e54";
      ctx.font = "12px Arial";
      let width = ctx.measureText(currentPrtcl.text).width;
      let height = 20;
      ctx.fillRect(5 + width / -2, -22, width + 20, height);
      ctx.fillStyle = "white";
      ctx.fillText(currentPrtcl.text, 15 + width / -2, -12);
      ctx.restore();
    }
  }

  function cancelAnimate() {
    cancelAnimationFrame(animationID);
  }

  function handleCursorOutOfViewPort(time) {
    if (!player.paused) changeCursorViewPort(time);
  }

  function changeCursorViewPort(time) {
    if (scrolling) return;
    let transitionLevel = 1;
    let margin = (endTimeShow - beginingTimeShow) * 0.2;
    let remainingTime = endTimeShow - time;

    if (remainingTime < margin && autoScroll) {
      let delta = margin - remainingTime;

      if (shift - delta * zoomLevel * transitionLevel < maximumShift) {
        shift = maximumShift;
      } else {
        shift -= delta * zoomLevel * transitionLevel;
      }
    } else if (endTimeShow < time || beginingTimeShow > time) {
      let s;

      if (endTimeShow <= time) {
        s = -1 * time * zoomLevel + w * 0.8;
      } else {
        s = -1 * time * zoomLevel + 200;
      }

      if (s < 0) {
        shift = s;
      } else {
        shift = 0;
      }
    }

    checkShift();
  }

  function drawBG(context, r = 1) {
    globalRatio = globalRatio * r;
    context.save();
    context.clearRect(0, 0, canvas2.width, canvas2.height);
    context.fillStyle = "transparent";
    context.fillRect(0, 0, w, h);
    context.lineWidth = 0.3;
    context.strokeStyle = "lightgrey";
    context.fillStyle = "black"; // vertical grid

    drawVerticalGrid(context);
    context.lineWidth = 0.5;
    context.strokeStyle = "gray"; //X-Axis

    drawXaxis(context);

    function drawVerticalGrid(ctx) {
      for (let i = 1; i < w; i++) {
        ctx.beginPath();

        if (i % 10 === 0) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, h);
          ctx.moveTo(i, 0);
        }

        ctx.closePath();
        ctx.stroke();
      }
    }

    function drawXaxis(ctx) {
      ctx.beginPath();

      for (let i = 0; i < w; i += 5) {
        if (i % 50 === 0) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 30);
          ctx.fillText(` ${toTime((i - shift) / zoomLevel)}`, i, 30);
        } else {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 10);
        }
      }

      ctx.closePath();
      ctx.stroke();
    }
  }

  function handleClick(e) {
    scrolling = cursorInScrollBar() && isMouseDown;
  }

  function cursorInScrollBar() {
    if (
      mouse.x > scrollPosition &&
      mouse.x < scrollPosition + scrollSize &&
      mouse.y > TIMELINE_HEIGHT - SCROLL_BAR_HEIGHT &&
      mouse.y < TIMELINE_HEIGHT
    ) {
      return true;
    } else {
      if (scrolling) return true;
    }

    return false;
  }

  function changeAutoScroll(a) {
    autoScroll = a.detail.status;
  }

  function drawScroll() {
    let cursorInScroll = cursorInScrollBar();
    scrolling = cursorInScroll && isMouseDown;

    if (cursorInScroll || scrolling) {
      canvas.classList.add("e-resize");
    } else {
      canvas.classList.remove("e-resize");
    }

    let context = ctx;
    context.save();
    context.fillStyle = "#e8e8e8";
    context.fillRect(0, TIMELINE_HEIGHT - 10, w, 10);
    context.fillStyle = cursorInScroll || scrolling ? "#2a74e2" : "#9ba4a9";
    let d = endTimeShow - beginingTimeShow;
    let rat = d / endTime;
    scrollSize = w * rat;
    if (rat > 1) rat = 1;
    let ratio = beginingTimeShow / endTime;
    scrollPosition = ratio * w;
    let padding = 1;
    context.fillRect(
      scrollPosition,
      TIMELINE_HEIGHT - SCROLL_BAR_HEIGHT + padding,
      scrollSize,
      SCROLL_BAR_HEIGHT - 2 - 2 * padding
    );
    context.restore();
  }

  function addListenerHandlers(canvas) {
    window.removeEventListener("resize", resize);
    window.addEventListener("resize", resize);
    canvas.removeEventListener("wheel", handleZoom);
    canvas.addEventListener("wheel", handleZoom);
    canvas.removeEventListener("mousemove", mousemoveGeneral);
    canvas.addEventListener("mousemove", mousemoveGeneral);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseup", mouseup);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousedown", handleMouseDown); // canvas.removeEventListener("dblclick", handleDbClick);
    // canvas.addEventListener("dblclick", handleDbClick);

    window.removeEventListener("changeAutoScroll", changeAutoScroll);
    window.addEventListener("changeAutoScroll", changeAutoScroll);
    canvas.removeEventListener("click", handleClick);
    canvas.addEventListener("click", handleClick);
  }

  function checkShift() {
    let newShift = w - endTime * zoomLevel;

    if (newShift > 0) {
      maximumShift = 0;
    } else {
      maximumShift = newShift;
    }

    if (shift < maximumShift) {
      shift = maximumShift;
    }
  }

  function animate() {
    var _player;

    if (!player) player = getPlayer();
    currentTime =
      ((_player = player) === null || _player === void 0
        ? void 0
        : _player.currentTime) || 0;
    calculateViewPortTimes();
    if (player) handleCursorOutOfViewPort(currentTime); //clear paper

    ctx.clearRect(0, 0, w, ctx.canvas.height); //draw boxes

    renderingPrtcls = prtcls.filter((e) => {
      let condition =
        (e.x >= -1 * shift && e.x + e.edge < -1 * shift + w) ||
        (e.x + e.edge > -1 * shift && e.x < -1 * shift + w);

      if (condition) {
        e.draw(ctx);
      }

      return condition;
    }); //tooltip

    if (beginingTimeShow > endTime) shift = endTime - beginingTimeShow; //red cursor time

    drawTimeCursor();
    drawScroll();
    checkShift();

    if (visibleTooltip && !resizing && !moving && !leftResize && !rightResize) {
      showTooltip();
    }

    handleCursor();
    drawBG(bgCtx);
    animationID = window.requestAnimationFrame(animate);
  }

  return {
    setData,
    cancelAnimate,
    changeZoom,
    changeCursorViewPort,
  };
}
