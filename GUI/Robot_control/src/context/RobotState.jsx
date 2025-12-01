import { createContext, useContext, useEffect, useState } from "react";
import robotConfig from "./RobotConfig";

const RobotStateContext = createContext()
export const RobotStateProvider = ({ children }) => {
    // const [joints, setJoints] = useState([
    //     { label: "J1 (base)", value: 0, min: -180, max: 180, type: "rotational" },
    //     { label: "J2 (hombro)", value: 0, min: -90, max: 90, type: "rotational" },
    //     { label: "J3 (codo)", value: 0, min: -90, max: 90, type: "rotational" },
    //     { label: "J4 (muñeca)", value: 0, min: -180, max: 180, type: "rotational" },
    //     { label: "Gripper", value: 0, min: 0, max: 100, type: "linear" }
    //   ])
    const jointConfig = robotConfig.joints
    const [joints, setJoints] = useState(
        robotConfig.joints.map(joint => joint.default ?? 0)
    )

    const cartesianConfig = robotConfig.cartesian
    const [cartesian, setCartesian] = useState(
        robotConfig.cartesian.map(cart => cart.default ?? 0)
    )
    return (
        <RobotStateContext.Provider value={{ joints, setJoints, jointConfig, cartesian, setCartesian, cartesianConfig }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)