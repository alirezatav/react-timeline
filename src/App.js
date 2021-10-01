import Timeline from "./lib/components/Timeline";

function App() {
  const data = [{ begin: 1000, end: 10000, text: "This is subtitle" }];

  const setAligns = () => {};
  const changeAreaShow = () => {};
  const changeShift = () => {};
  const changeZoomLevel = () => {};
  return (
    <div className="App">
      <Timeline
        paddingLeft={300}
        paddingRight={500}
        changeAreaShow={changeAreaShow}
        changeZoomLevel={changeZoomLevel}
        changeShift={changeShift}
        setAligns={setAligns}
        src={2}
        data={data}
      />{" "}
    </div>
  );
}

export default App;
