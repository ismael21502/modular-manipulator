import React, { useState, useEffect } from 'react'
import * as Select from "@radix-ui/react-select";
import SavePosModal from './SavePosModal';
import PositionsCard from './PositionsCard';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useRobotState } from '../context/RobotState';
import EditPosPopUp from './EditPosPopUp';

function Positions() {
    const { positions, deletePos } = useWebSocket()
    const { colors } = useTheme()
    const { jointConfig, moveRobot } = useRobotState()

    const [showSavePopUp, setShowSavePopUp] = useState(false)
    const [showEditPopUp, setShowEditPopUp] = useState(false)
    const [selectedPos, setSelectedPos] = useState("")


    function sendPos() {
        const target = positions.find(pos => pos.name === selectedPos);
        if (target) moveRobot(target.values);
    }

    const handleSaving = () => {
        setShowSavePopUp(true)
    }

    const handleEditing = () => {
        setShowEditPopUp(true)
    }

    return (
        // bg - [#1F1F1F] border-[#4A4A4A] bg-[#2B2B2B] text-white
        <div className="flex flex-1 flex-col min-h-0">
            {/* scrollable content */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-5 p-5">
                {positions.map((position, i) => (
                    <PositionsCard key={position.name} name={position.name} joints={position.values} labels={jointConfig.map(joint => joint.label)} setSelected={setSelectedPos} isActive={position.name == selectedPos ? true : false} />
                ))}
            </div>
            <div className='flex flex-col p-4 gap-3 border-t'
                style={{ borderColor: colors.border, color: colors.text.primary }}>
                {selectedPos !== ""
                    ? <div className='flex flex-row justify-between gap-3 '>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}1A` }}
                            onClick={() => {handleEditing()}}>
                            <EditIcon />
                            <p>Editar</p>
                        </button>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.danger, color: colors.danger, backgroundColor: `${colors.danger}1A` }}
                            onClick={() => { deletePos(selectedPos), setSelectedPos("") }}>
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
                        <SaveIcon />
                        <p>Guardar nueva pose</p>
                    </button>
                </div>
                {selectedPos !== ""
                    ? <div className='flex text-white'>
                        <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md'
                            style={{ backgroundColor: colors.primaryDark }}
                            onClick={sendPos}>
                            <PlayArrowRoundedIcon />
                            <p>Reproducir movimiento</p>
                        </button>
                    </div>
                    : null}
            </div>
            <SavePosModal
                isOpen={showSavePopUp}
                setIsOpen={setShowSavePopUp} />
            <EditPosPopUp
                isOpen={showEditPopUp}
                setIsopen={setShowEditPopUp}
                selectedPos={selectedPos} />
        </div>
    )
}

export default Positions
