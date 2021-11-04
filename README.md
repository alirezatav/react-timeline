
# react-subtitle-editor

  

A React component for adjust subtitles and synchronize easier

  

# Install

  

```

npm i react-subtitle-editor

```

  

# Try it
![enter image description here](https://im7.ezgif.com/tmp/ezgif-7-91e8964c1870.gif)
[Demo](https://codesandbox.io/s/vibrant-yalow-2og1l)

  

# Usage

```javascript

import  React  from  "react";

import  Timeline  from  "react-subtitle-editor";

  

function  App() {

const  mediaRef = useRef(); //access audio/video element.

const  data = [{ begin:  25, end:  35, text:  "This is subtitle" }];

  

return (

<div>

<button  onClick={() =>  audioRef.current.play()}>play</button>

<button  onClick={() =>  audioRef.current.pause()}>pause</button>

  

<Timelines

changeAreaShow={(start, end) => {}}

changeZoomLevel={(zoomLevel) => {}}

changeShift={(shift) => {}}

setAligns={(alignments) => {}}

audioRef={mediaRef}

src={"..."}

data={data}

autoScroll

colors={{

background:  "transparent",

box:  "#a9a9a9",

boxHover:  "#80add6",

selectedBox:  "#1890ff",

playingBox:  "#f0523f",

text:  "#212b33",

selectedText:  "white",

tooltipBackground:  "#474e54",

tooltipText:  "white",

scrollBarBackground:  "#f1f3f9",

scrollBar:  "#c2c9d6",

scrollBarHover:  "#8f96a3",

}}

/>

</div>

);

}

```

  

## Props

  

| Prop | Type | Description |

| --------------- | ---------------------------------------------- | ----------------------------------------------- |

| paddingLeft | Number | padding left. |

| paddingRight | Number | padding right. |

| data | [{ begin: Number, end: Number, text: String }] | Alignments data (begin and end unit is second). |

| src | String | Video or audio source. |

| audioRef | React.RefObject | Video or audio ref. |

| changeAreaShow | Function | Callback when viewport changed. |

| changeZoomLevel | Function | Callback when zoom level changed. |

| changeShift | Function | Callback when shift changed. |

| setAligns | Function | Callback when data times changed. |

| colors | Object | Colors object (see example). |

  

Others props will be ready soon.

  

# Contributing

  

coming soon