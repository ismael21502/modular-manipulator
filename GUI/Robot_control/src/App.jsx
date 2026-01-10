import CartesianControl from "./components/widgets/controls/CartesianPanel.jsx"
import Gripper from "./components/widgets/controls/GripperControlPanel.jsx"
import ManualControl from "./components/widgets/controls/JointControlPanel.jsx"
import RobotModel from "./components/widgets/3D/RobotModel.jsx"
import Positions from "./components/widgets/positions/Positions.jsx"
import Terminal from "./components/widgets/terminal/Terminal.jsx"
import Sequences from "./components/widgets/sequences/Sequences.jsx"
import Header from "./components/widgets/header/Header.jsx"
import { useTheme } from "./context/ThemeContext.jsx"
import { useState } from "react"
import Tab from "./components/ui/nav/Tab.jsx"
import CustomScroll from "./components/ui/scrolls/CustomScroll.jsx"
import ConfigurationModal from "./components/widgets/configuration/ConfigurationModal.jsx"

function App() {
  const { colors } = useTheme()
  const [selectedMode, setSelectedMode] = useState("positions")
  const [openConfig, setOpenConfig] = useState(false)
  return (
    <div className="h-[100vh] flex flex-col transition-colors duration-150 ease-in-out"
      style={{ backgroundColor: colors.background }}>
      <Header title={"Robot control"} openConfig={()=>setOpenConfig(true)}/>
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
            <RobotModel />
          </div>
          <div className="flex h-[35%]">
            <Terminal />
          </div>
        </div>
        <div className="flex-[1_1_25%] overflow-y-auto">
          <CustomScroll scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
            <CartesianControl />
            <Gripper />
            <ManualControl />
          </CustomScroll>
        </div>
      </div>

      {openConfig && <ConfigurationModal onClose={()=> setOpenConfig(false)}/>}
    </div>

  )
}

export default App
