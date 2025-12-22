import { createContext, useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { useRobotConfig } from "./RobotConfig";

const RobotStateContext = createContext()
export const RobotStateProvider = ({ children }) => {
    const { robotConfig } = useRobotConfig()
    
    const jointConfig = robotConfig.joints
    const [joints, setJoints] = useState(
        robotConfig.joints.map(joint => joint.default ?? 0)
    )
    const jointsRef = useRef(joints)
    const [isPlaying, setIsPlaying] = useState(false)
    
    useEffect(() => {
        jointsRef.current = joints
    }, [joints])

    useEffect(() =>{
        setJoints(
            robotConfig.joints.map(joint => joint.default ?? 0)
        )
        setCartesian(
            robotConfig.cartesian.map(cart => cart.default ?? 0)
        )
    },[robotConfig])
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
        if(isPlaying) return
        setIsPlaying(true)
        const sequence = sequences.find(seq => seq.name === selectedPos)
        if (sequence === null) return
        for (const step of sequence.steps) {
            const target = step.joints
            if (target) await moveRobot(target, step.duration)
            await delay(step.delay)
        }
        setIsPlaying(false)
    }
    
    const startPosition = async (targetValues) => {
        setIsPlaying(true)
        if (targetValues) await moveRobot(targetValues)
        setIsPlaying(false)
    }

    return (
        <RobotStateContext.Provider value={{ joints, setJoints, jointConfig, cartesian, setCartesian, cartesianConfig, startPosition, startSequence, isPlaying }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)