import CartesianControl from "./components/CartesianControl.jsx"
import Gripper from "./components/Gripper.jsx"
import ManualControl from "./components/ManualControl.jsx"
import RobotModel from "./components/RobotModel.jsx"
import Positions from "./components/Positions.jsx"
import Console from "./components/Console.jsx"
import Sequences from "./components/Sequences.jsx"
import Header from "./components/Header.jsx"
import { useTheme } from "./context/ThemeContext.jsx"
import { useState } from "react"
import Tab from "./components/Tab.jsx"
import CustomScroll from "./components/CustomScroll.jsx"

function App() {
  const { colors } = useTheme()
  const [selectedMode, setSelectedMode] = useState("positions")
  return (
    <div className="h-[100vh] flex flex-col transition-colors duration-150 ease-in-out"
      style={{ backgroundColor: colors.background }}>
      <Header title={"Robot control"} />
      <div className="flex flex-1 flex-row min-h-0">
        <div className="flex-[1_1_25%] min-w-0 min-h-0 flex flex-col">
          {/* tabs */}
          <div className='w-full text-md flex flex-row text-center border-b'
            style={{ borderColor: colors.border, color: colors.text.title, fontWeight: 'bold' }}>

            <Tab isActive={"positions" === selectedMode} name={"positions"} label={"POSICIONES"} setSelected={setSelectedMode} />
            <Tab isActive={"sequences" === selectedMode} name={"sequences"} label={"SECUENCIAS"} setSelected={setSelectedMode} />

          </div>
          {selectedMode === "positions"
            ? <Positions />
            : <Sequences />}
        </div>

        <div className="flex-[2_1_50%] min-w-0 h-full">
          <div className="flex h-[65%]">
            <RobotModel opening={0} />
          </div>
          <div className="flex h-[35%]">
            <Console />
          </div>
        </div>
        <div className="flex-[1_1_25%] overflow-y-auto">
          <CustomScroll scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
            <CartesianControl />
            <Gripper opening={0} handleChangeOpening={() => { }} />
            <ManualControl joints={{
              'J1': 0,
              'J2': -90,
              'J3': 90
            }}
              handleChangeJoint={() => { }} />
          </CustomScroll>

        </div>
      </div>
    </div>

  )
}

export default App
