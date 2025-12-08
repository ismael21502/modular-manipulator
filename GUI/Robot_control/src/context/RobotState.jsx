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
    
    const sequences = [{
        name: "Pick and place",
        updated_at: new Date().toISOString(),    // string ISO
        steps: [
            { //Cambiar por ref a home
                type: "inline",
                joints: [0, -25, 65, 90, 0],
                delay: 100, //ms
                duration: 700, // ms 
                label: "Home"  // opcional
            },
            {
                type: "inline",
                joints: [0, 15, 25, 110, 0],
                delay: 100, //ms
                duration: 400, // ms 
                label: "Start"  // opcional
            },
            {
                type: "inline",
                joints: [0, 15, 25, 110, 100],
                delay: 200,
                duration: 500,
                label: "Pick"
            },
            {
                type: "inline",
                joints: [0, 15, 25, 50, 100],
                delay: 150,
                duration: 600,
                label: "Lift"
            },
            {
                type: "inline",
                joints: [180, 15, 25, 50, 100],
                delay: 150,
                duration: 1200,
                label: "Turn"
            },
            {
                type: "inline",
                joints: [180, 15, 25, 110, 100],
                delay: 100,
                duration: 600,
                label: "Lftn't"
            },
            {
                type: "inline",
                joints: [180, 15, 25, 110, 0],
                delay: 150,
                duration: 500,
                label: "Release"
            },
        ]
    }]
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

    const startSequence = async (selectedPos) => {
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
        <RobotStateContext.Provider value={{ joints, setJoints, jointConfig, cartesian, setCartesian, cartesianConfig, moveRobot, startSequence, sequences }}>
            {children}
        </RobotStateContext.Provider>
    )
}

export const useRobotState = () => useContext(RobotStateContext)