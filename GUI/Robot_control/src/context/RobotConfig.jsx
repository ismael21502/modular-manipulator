import { useContext, createContext, useState } from "react";
const RobotConfigContext = createContext()

export const RobotConfigProvider = ({ children }) => {
    const [robotConfig, setRobotConfig] = useState({
        name: "Robot Arm",
        joints: [
            {
                "id": "j1",
                "label": "J1",
                "type": "rotational",
                "min": -180,
                "max": 180,
                "default": 0,
                "unit": "deg"
            },
            {
                "id": "gripper",
                "label": "Gripper",
                "type": "linear",
                "min": 0,
                "max": 100,
                "default": 0,
                "unit": "%"
            }
        ],
        "cartesian": [
            {
                "id": "x",
                "label": "X",
                "min": -500,
                "max": 500,
                "default": 0,
                "unit": "mm"
            }
        ]
    })
    return (
        <RobotConfigContext.Provider value={{robotConfig, setRobotConfig}}>
            {children}
        </RobotConfigContext.Provider>
    )
}
export const useRobotConfig = () => useContext(RobotConfigContext)