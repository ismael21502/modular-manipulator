import { createContext, useContext, useState } from "react";

const RobotStateContext = createContext()
export const RobotStateProvider = ({ children }) => {
    const [joints, setJoints] = useState([0,0,0,0,0])
    const [labels, setLabels] = useState(['J1 (base)', 'J2 (hombro)', 'J3 (codo)', 'J4 (muñeca)', 'Gripper'])
    return (
        <RobotStateContext.Provider value={{joints, labels, setJoints}}> 
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)