# react-timeline-editor

React Timeline adjustment

# Install

Just add it to your project:

```
npm i react-timeline-editor
```

# Demo

[click to see demo]()

# Usage

```javascript
import React from "react";
import Timeline from "react-timeline-editor";

const data = [{ begin: 1000, end: 3000, text: "This is subtitle" }];

ReactDOM.render(
  <Timeline
    paddingLeft={10}
    paddingRight={10}
    changeAreaShow={() => {}}
    changeZoomLevel={() => {}}
    changeShift={() => {}}
    setAligns={() => {}}
    src={"..."}
    data={data}
  />,
  document.getElementById("root")
);
```

## Props

| Prop            | Type                                           | Description                                     |
| --------------- | ---------------------------------------------- | ----------------------------------------------- |
| paddingLeft     | Number                                         | padding left.                                   |
| paddingRight    | Number                                         | padding right.                                  |
| data            | [{ begin: Number, end: Number, text: String }] | Alignments data (begin and end unit is second). |
| src             | String                                         | Video or audio source.                          |
| changeAreaShow  | Function                                       | Callback when viewport changed.                 |
| changeZoomLevel | Function                                       | Callback when zoom level changed                |
| changeShift     | Function                                       | Callback when shift changed.                    |
| setAligns       | Function                                       | Callback when data times changed                |

Others props will be ready.

# Contributing

coming soon
