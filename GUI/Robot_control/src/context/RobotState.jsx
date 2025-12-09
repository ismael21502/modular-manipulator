import { createContext, useContext, useEffect, useState } from "react";
import robotConfig from "./RobotConfig";
import { useRef } from "react";
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
    const jointsRef = useRef(joints)

    useEffect(() => {
        jointsRef.current = joints
    }, [joints])
    const cartesianConfig = robotConfig.cartesian
    const [cartesian, setCartesian] = useState(
        robotConfig.cartesian.map(cart => cart.default ?? 0)
    )

    function moveRobot(targetJoints, duration=700) {
        return new Promise((resolve) => {
            const start = performance.now()

            // Clonamos el valor ACTUAL de "joints" y no uno desfasado
            const initial = jointsRef.current;   // Usaremos un ref 👈
            const target = targetJoints

            function animate(time) {
                const elapsed = time - start;
                const t = Math.min(elapsed / duration, 1);

                const newJoints = initial.map((startVal, i) => {
                    const endVal = target[i]
                    return Math.round(startVal + t * (endVal - startVal))
                });

                setJoints(newJoints)

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve()  // 👈 mueve la promesa cuando esté terminado
                }
            }

            requestAnimationFrame(animate);
        })
    }

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    const startSequence = async (selectedPos, sequences) => {
        const sequence = sequences.find(seq => seq.name === selectedPos)
        if (sequence === null) return
        for (const step of sequence.steps) {
            const target = step.joints
            if (target) await moveRobot(target, step.duration)
            await delay(step.delay * 5)
        }
    }
    // const startSequence = async (sequence) => {
    //     for (const step of sequence.steps) {
    //         await moveRobot(step.joints)
    //         await delay(step.delay)
    //     }
    // }

    return (
        <RobotStateContext.Provider value={{ joints, setJoints, jointConfig, cartesian, setCartesian, cartesianConfig, moveRobot, startSequence }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)