import CartesianControl from "./components/CartesianControl.jsx"
import Gripper from "./components/Gripper.jsx"
import ManualControl from "./components/ManualControl.jsx"
import RobotModel from "./components/RobotModel.jsx"
import Positions from "./components/Positions.jsx"
import Console from "./components/Console.jsx"
import Sequences from "./components/Sequences.jsx"
import Header from "./components/Header.jsx"
import { useTheme } from "./context/ThemeContext.jsx"
function App() {
  const { colors } = useTheme()
  return (
      <div className="h-[100vh] flex flex-col"
      style={{backgroundColor: colors.background}}>
        <Header title={"Robot control"} />
        <div className="flex flex-1 flex-row min-h-0">
          <div className="flex-[1_1_25%] min-w-0">
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
          </div>

          <div className="flex-[2_1_50%] min-w-0 h-full">
            <div className="flex h-[65%]">
              <RobotModel angles={[0, 0, 0]} opening={0} />
            </div>
            <div className="flex h-[35%]">
              <Console
                logs={[
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "WARNING",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "DEBUG",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "ERROR",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  },
                  {
                    'type': "INFO",
                    'time': '12034',
                    'values': 'aaaaaaa'
                  }
                ]} 
                setLogs={()=>{}} 
                isConnected={true} 
                reconnect={()=>{}} 
                loadPositions={()=>{}}
              />
            </div>
          </div>
          <div className="flex-[1_1_25%]">
                <Gripper opening={0} handleChangeOpening={()=>{}}/>
          </div>
        </div>
      </div>

  )
}

export default App
