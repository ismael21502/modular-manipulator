import React, { useState, useEffect } from 'react'
import SavePopUp from './SavePopUp';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useRobotState } from '../context/RobotState';
import SequencesCard from './SequencesCard';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { useRef } from 'react';
function Sequences() {
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

    //Posible formato de referencia de posiciones
    // { "type": "ref", "positionId": "home", "delay": 500 },

    const { positions, deletePos } = useWebSocket()
    const { colors } = useTheme()
    const { joints, setJoints } = useRobotState()
    const jointsRef = useRef(joints)

    useEffect(() => {
        jointsRef.current = joints
    }, [joints])

    const [newPosName, setNewPosName] = useState("")
    const [showPopUp, setShowPopUp] = useState(false)
    const [selectedPos, setSelectedPos] = useState("")

    function moveRobot(targetJoints, duration) {
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
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const startSequence = async () =>{
        const sequence = sequences.find(seq => seq.name === selectedPos)
        if (sequence === null) return
        for (const step of sequence.steps) {
            const target = step.joints
            if (target) await moveRobot(target, step.duration)
            await delay(step.delay*5)
        }
    }
    function sendPos() {
        const target = positions.find(pos => pos.name === selectedPos);
        if (target) moveRobot(target.joints);
    }

    const handleSaving = () => {
        //setShowPopUp(true)
    }

    return (
        // bg - [#1F1F1F] border-[#4A4A4A] bg-[#2B2B2B] text-white
        <div className="flex flex-1 flex-col min-h-0">
            {/* scrollable content */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-5 p-5">
                {sequences.map(sequence => (
                    <SequencesCard key={sequence.name} sequence={sequence} setSelected={setSelectedPos} isActive={sequence.name == selectedPos ? true : false} />
                ))}
            </div>
            <div className='flex flex-col p-4 gap-3 border-t'
                style={{ borderColor: colors.border, color: colors.text.primary }}>
                {selectedPos !== ""
                    ? <div className='flex flex-row justify-between gap-3 '>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}1A` }}>
                            <EditIcon />
                            <p>Editar</p>
                        </button>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.danger, color: colors.danger, backgroundColor: `${colors.danger}1A` }}
                            onClick={() => { }}>
                            <DeleteIcon />
                            <p>Borrar</p>
                        </button>
                    </div>
                    : null}
                <div className='flex w-full'
                    style={{ borderColor: colors.border, color: colors.text.primary }}>
                    <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                        style={{ borderColor: colors.border }}
                        onClick={() => { handleSaving() }}>
                        <RadioButtonCheckedIcon />
                        <p>Grabar</p>
                    </button>
                </div>
                {selectedPos !== ""
                    ? <div className='flex text-white'>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md'
                            style={{ backgroundColor: colors.primaryDark }}
                            onClick={startSequence}>
                            <PlayArrowRoundedIcon />
                            <p>Ejecutar secuencia</p>
                        </button>
                    </div>
                    : null}


            </div>


            <SavePopUp
                isOpen={showPopUp}
                setIsopen={setShowPopUp} />
        </div>
    )
}

export default Sequences
