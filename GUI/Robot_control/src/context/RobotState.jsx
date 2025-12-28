import { createContext, useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { useRobotConfig } from "./RobotConfig";

const RobotStateContext = createContext()
export const RobotStateProvider = ({ children }) => {
    const { robotConfig } = useRobotConfig()
    
    const [robotState, setRobotState] = useState({
        joints: robotConfig.joints.map(joint => joint.default ?? 0),
        endEffectors: robotConfig.end_effectors.map(effector => effector.default ?? 0),
    })

    const robotApi = {
        setJoints(joints) {
            setRobotState(prev => ({ ...prev, joints }))
        },
        setJoint(i, value) {
            setRobotState(prev => {
                const joints = [...prev.joints]
                joints[i] = value
                return { ...prev, joints }
            })
        },
        setEndEffectors(values) {
            setRobotState(prev => ({ ...prev, endEffectors: values }))
        },
        setEndEffector(i, value) {
            setRobotState(prev => {
                const tools = [...prev.endEffectors]
                tools[i] = value
                return { ...prev, endEffectors: tools }
            })
        }
      }

    const jointConfig = robotConfig.joints
    
    const jointsRef = useRef(robotState.joints)
    const [isPlaying, setIsPlaying] = useState(false)
    
    useEffect(() => {
        jointsRef.current = robotState.joints
    }, [robotState.joints])

    
    const endEffectorsRef = useRef(robotState.endEffectors)
    useEffect(()=>{
        endEffectorsRef.current = (robotState.endEffectors)
    }, [robotState.endEffectors])


    useEffect(() =>{
        robotApi.setJoints(
            robotConfig.joints.map(joint => joint.default ?? 0)
        )
        robotApi.setEndEffectors(
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

                robotApi.setJoints(newJoints)

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
        <RobotStateContext.Provider value={{ jointConfig, cartesian, setCartesian, cartesianConfig, startPosition, startSequence, isPlaying, 
            robotConfig, robotState, setRobotState, robotApi }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)