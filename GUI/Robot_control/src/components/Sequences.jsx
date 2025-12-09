import React, { useState, useEffect } from 'react'
import SaveSeqModal from './SaveSeqModal';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useRobotState } from '../context/RobotState';
import SequencesCard from './SequencesCard';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UndoIcon from '@mui/icons-material/Undo';

function Sequences() {
    const { joints, startSequence } = useRobotState()
    const { sequences } = useWebSocket()
    //Posible formato de referencia de posiciones
    // { "type": "ref", "positionId": "home", "delay": 500 },
    const { colors } = useTheme()
    const [selectedeSequence, setSelectedeSequence] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [steps, setSteps] = useState([])
    const [showSaveModal, setShowSaveModal] = useState(false)

    const captureStep = () => { //Revisar si es un nombre apropiado
        console.log(steps.length)
        setSteps(prev => [
            ...prev,
            {
                type: "inline",
                joints: joints,
                delay: 200, //ms
                duration: 1000, // ms 
                label: `Paso ${steps.length+1}`  // opcional
            }
        ])
    }
    const deleteStep = () => {
        if(steps.length == 0) return
        setSteps(prev => prev.slice(0, -1))
    }
    const saveSequence = () =>{
        //Modal de guardado
        setShowSaveModal(true)
        // setSteps([])
        // setIsRecording(false)
    }
    return (
        // bg - [#1F1F1F] border-[#4A4A4A] bg-[#2B2B2B] text-white
        <div className="flex flex-1 flex-col min-h-0">
            {/* scrollable content */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-5 p-5">
                {sequences.map(sequence => (
                    <SequencesCard key={sequence.name} sequence={sequence} setSelected={setSelectedeSequence} isActive={sequence.name == selectedeSequence ? true : false} />
                ))}
            </div>
            {isRecording
                ? <div className='flex flex-col pb-4 gap-3 border-t'
                    style={{ borderColor: colors.border, color: colors.text.primary, }}>
                    <div className='flex flex-row justify-between w-full px-4 py-2'
                        style={{ backgroundColor: `${colors.danger}23`, color: colors.danger, borderBottom: "1px solid", borderColor: colors.border }}>
                        <div className='flex flex-row gap-2 items-center font-bold'>
                            <div className="rounded-full w-3 h-3 animate-pulse-rec"
                            style={{backgroundColor: colors.danger}}>
                            </div>
                            <p>GRABANDO</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <p>{steps.length} pasos</p>
                        </div>
                    </div>
                    <div className='flex w-full px-4 gap-3'>
                            <button className='button flex flex-1 p-2 justify-center gap-2 cursor-pointer rounded-md border-1'
                                style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}23` }}
                                onClick={captureStep}>
                                <AddCircleIcon />
                                <p>Capturar paso</p>
                            </button>
                            <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                                style={{ borderColor: colors.accent, color: colors.accent, backgroundColor: `${colors.accent}1A` }}
                                onClick={deleteStep}>
                                    {/* Revisar el color de esto */}
                                <UndoIcon />
                                <p>Deshacer</p>
                            </button>
                    </div>
                    <div className='flex w-full px-4'
                    >
                        <button className='button flex flex-1 p-2 justify-center gap-2 cursor-pointer rounded-md text-white'
                            style={{ backgroundColor: colors.danger }}
                            onClick={saveSequence}>
                            <StopCircleIcon />
                            <p>Terminar </p>
                        </button>
                    </div>
                </div>
                : <div className='flex flex-col p-4 gap-3 border-t'
                    style={{ borderColor: colors.border, color: colors.text.primary }}>
                    {selectedeSequence !== ""
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
                            onClick={() => { setIsRecording(true) }}>
                            <RadioButtonCheckedIcon />
                            <p>Grabar</p>
                        </button>
                    </div>
                    {selectedeSequence !== ""
                        ? <div className='flex text-white'>
                            <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md'
                                style={{ backgroundColor: colors.primaryDark }}
                                onClick={() => { startSequence(selectedeSequence, sequences) }}>
                                <PlayArrowRoundedIcon />
                                <p>Ejecutar secuencia</p>
                            </button>
                        </div>
                        : null}


                </div>
            }
            <SaveSeqModal isOpen={showSaveModal} setIsOpen={setShowSaveModal} steps={steps} setSteps={setSteps}/>
        </div>
    )
}

export default Sequences
