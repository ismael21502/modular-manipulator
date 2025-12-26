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

    const endEffectorsConfig = robotConfig.end_effectors
    const [endEffectors, setEndEffectors] = useState(
        robotConfig.end_effectors.map(effector => effector.default ?? 0)
    )
    const endEffectorsRef = useRef(endEffectors)
    useEffect(()=>{
        endEffectorsRef.current = endEffectors
    },[endEffectors])


    useEffect(() =>{
        setJoints(
            robotConfig.joints.map(joint => joint.default ?? 0)
        )
        setEndEffectors(
            robotConfig.end_effectors.map(effector => effector.default ?? 0)
        )
        setCartesian(
            robotConfig.cartesian.map(cart => cart.default ?? 0)
        )
    },[robotConfig])
    const cartesianConfig = robotConfig.cartesian
    const [cartesian, setCartesian] = useState(
        robotConfig.cartesian.map(cart => cart.default ?? 0)
    )

    function moveRobot(targetJoints, targetEndEffectors = null, duration=700) {
        return new Promise((resolve) => {
            const start = performance.now()

            // Clonamos el valor ACTUAL de "joints" y no uno desfasado
            const initialJoints = jointsRef.current;  
            const initialEndEffectors = endEffectorsRef.current
            const jointsTarget = targetJoints

            function animate(time) {
                const elapsed = time - start;
                const t = Math.min(elapsed / duration, 1);

                const newJoints = initialJoints.map((startVal, i) => {
                    const endVal = jointsTarget[i]
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
            const jointsTarget = step.joints
            if (jointsTarget) await moveRobot(jointsTarget, step.duration)
            await delay(step.delay)
        }
        setIsPlaying(false)
    }
    
    const startPosition = async (targetJointsValues) => {
        setIsPlaying(true)
        if (targetJointsValues) await moveRobot(targetJointsValues)
        setIsPlaying(false)
    }

    return (
        <RobotStateContext.Provider value={{ joints, setJoints, jointConfig, endEffectors, setEndEffectors, endEffectorsConfig, cartesian, setCartesian, cartesianConfig, startPosition, startSequence, isPlaying }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)