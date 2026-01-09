import { createContext, useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { useRobotConfig } from "./RobotConfig";

const RobotStateContext = createContext()
export const RobotStateProvider = ({ children }) => {
    const { robotConfig } = useRobotConfig()

    const [robotState, setRobotState] = useState({
        joints: robotConfig.joints.map(joint => joint.default ?? 0),
        endEffectors: robotConfig.end_effectors.map(effector => effector.default ?? 0),
        state: 'idle'
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
    
    const jointsRef = useRef(robotState.joints)
    const [isPlaying, setIsPlaying] = useState(false)

    const articularListeners = useRef([])
    const endEffectorsListeners = useRef([])

    const notifyArticularChange = (joints) => {
        articularListeners.current.forEach(callback => callback(joints))
    }

    const notifyEndEffectorsChange = (endEffectors) => {
        endEffectorsListeners.current.forEach(callback => callback(endEffectors))
    }

    const subscribeArticular = (callback) => {
        articularListeners.current.push(callback)
        return () => {
            articularListeners.current = articularListeners.current.filter(listener => listener !== callback)
        }
      }

    const subscribeEndEffectors = (callback) => {
        endEffectorsListeners.current.push(callback)
        return () => {
            endEffectorsListeners.current = endEffectorsListeners.current.filter(listener => listener !== callback)
        }
    }

    useEffect(() => {
        jointsRef.current = robotState.joints
        // console.log(robotState.joints)
    }, [robotState.joints])


    const endEffectorsRef = useRef(robotState.endEffectors)
    useEffect(() => {
        endEffectorsRef.current = (robotState.endEffectors)
    }, [robotState.endEffectors])


    useEffect(() => {
        robotApi.setJoints(
            robotConfig.joints.map(joint => joint.default ?? 0)
        )
        robotApi.setEndEffectors(
            robotConfig.end_effectors.map(effector => effector.default ?? 0)
        )
        setCartesian(
            robotConfig.cartesian.map(cart => cart.default ?? 0)
        )
    }, [robotConfig])
    const cartesianConfig = robotConfig.cartesian
    const [cartesian, setCartesian] = useState(
        robotConfig.cartesian.map(cart => cart.default ?? 0)
    )

    // useEffect(() => {
    //     console.log(robotState.joints)
    // },[robotState.joints])

    function moveRobot(targetJoints, targetEndEffectors = [0], duration = null) {
        // if (duration === null || duration <= 0) { // Calcular duración basado en un factor de velocidad
        //     robotApi.setJoints(targetJoints)
        //     robotApi.setEndEffectors(targetEndEffectors)
        //     return Promise.resolve()  // retornamos una promesa resuelta inmediatamente
        // }
        if (duration === null || duration <= 0) {
            duration = 700
        }
        return new Promise((resolve) => {
            const start = performance.now()

            // Clonamos el valor ACTUAL de "joints" y no uno desfasado
            const initialJoints = jointsRef.current;
            const initialEndEffectors = endEffectorsRef.current
            const jointsTarget = targetJoints
            const endEffectorsTarget = targetEndEffectors

            function animate(time) {
                const elapsed = time - start;
                const t = Math.min(elapsed / duration, 1);

                const newJoints = initialJoints.map((startVal, i) => {
                    const endVal = jointsTarget[i]
                    return Math.round(startVal + t * (endVal - startVal))
                })

                notifyArticularChange(newJoints)
                
                const newEndEffectors = initialEndEffectors.map((startVal, i) => {
                    const endVal = endEffectorsTarget[i]
                    return Math.round(startVal + t * (endVal - startVal))
                })

                notifyEndEffectorsChange(newEndEffectors)

                robotApi.setJoints(newJoints)
                robotApi.setEndEffectors(newEndEffectors)
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
        if (isPlaying) return
        setIsPlaying(true)
        const sequence = sequences.find(seq => seq.name === selectedPos)
        if (sequence === null) return
        for (const step of sequence.steps) {
            const jointsTarget = step.joints
            const endEffectorsTarget = step.endEffectors
            if (jointsTarget && endEffectorsTarget) await moveRobot(jointsTarget, endEffectorsTarget, step.duration)
            await delay(step.delay)
        }
        setIsPlaying(false)
    }

    const startPosition = async (targetJoints, targetEndEffectors = [0], duration=null) => {
        setIsPlaying(true)
        if (targetJoints) await moveRobot(targetJoints, targetEndEffectors, duration)
        setIsPlaying(false)
    }
    return (
        <RobotStateContext.Provider value={{
            cartesian, setCartesian, cartesianConfig, startPosition, startSequence, isPlaying,
            robotConfig, robotState, setRobotState, robotApi, subscribeArticular, subscribeEndEffectors
        }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)