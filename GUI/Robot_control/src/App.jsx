import CartesianControl from "./components/CartesianControl.jsx"
import Gripper from "./components/Gripper.jsx"
import ManualControl from "./components/ManualControl.jsx"
import RobotModel from "./components/RobotModel.jsx"
import Positions from "./components/Positions.jsx"
import Console from "./components/Console.jsx"
import Sequences from "./components/Sequences.jsx"
import { useRef, useEffect, useState } from "react"
import Header from "./components/Header.jsx"

function App() {

  return (
    <>
      <div className="h-[100vh] flex flex-col">
        <Header title={"Robot control"} />
        <div className="flex flex-1 min-h-0 flex-row">
          <Positions
            joints={{}} setJoints={{}}
            setLogs={{}}
            loadPositions={() => { }}
            isConnected={false}
            opening={{}} setOpening={() => { }}
            coords={{}}
            setCoords={{}}
            setShowSequences={{}}
            ws={{}}
          />
          {/* <RobotModel angles={[]} opening={0} /> */}

        </div>
      </div>

    </>
  )
}

export default App
