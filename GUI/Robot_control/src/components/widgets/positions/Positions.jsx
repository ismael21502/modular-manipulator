import React, { useState, useEffect } from 'react'
import SavePosModal from '../modals/SavePosModal';
import PositionsCard from './PositionsCard';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../../../context/themes/ThemeContext';
import { useWebSocket } from '../../../context/WebSocketContext';
import { useRobotState } from '../../../context/RobotState';
import EditPosModal from '../modals/EditPosModal';
import CustomScroll from '../../ui/scrolls/CustomScroll';
import LoadingIndicator from '../../ui/indicators/LoadingIndicator';
import PopUp from '../../ui/popUps/PopUp'
import HollowButton from '../../ui/buttons/HollowButton';
import SolidButton from '../../ui/buttons/SolidButton';

function Positions() {
    const { positions, deletePos } = useWebSocket()
    const { colors } = useTheme()
    const { startPosition, isPlaying } = useRobotState()
    const state = useRobotState()

    const jointConfig = state.robotConfig.joints
    const endEffectorsConfig = state.robotConfig.end_effectors

    const [showSavePopUp, setShowSavePopUp] = useState(false)
    const [showEditPopUp, setShowEditPopUp] = useState(false)
    const [selectedPos, setSelectedPos] = useState("")

    const [popUp, setPopUp] = useState(null)

    function sendPos() {
        const target = positions.find(pos => pos.name === selectedPos);
        if (target) startPosition(target.values, target.endEffectorValues);
    }

    const handleSaving = () => {
        setShowSavePopUp(true)
    }

    const handleEditing = () => {
        setShowEditPopUp(true)
    }

    const handleDelete = () => {
        setPopUp({
            type: "danger",
            title: "Eliminar posición",
            message: `¿Estás seguro que deseas eliminar ${selectedPos}?`,
            onConfirm: () => {
                deletePos(selectedPos)
                setSelectedPos("")
                setPopUp(null)
            },
            onCancel: () => {
                setPopUp(null)
            }
        })
    }

    return (
        // bg - [#1F1F1F] border-[#4A4A4A] bg-[#2B2B2B] text-white
        <div className="flex flex-1 flex-col min-h-0">
            {/* scrollable content */}

            <CustomScroll scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-5 p-5">
                    {positions.map(position => (
                        <PositionsCard
                            key={position.name}
                            name={position.name}
                            joints={position.values}
                            endEffectors={position.endEffectorValues}
                            jointLabels={jointConfig.map(joint => joint.label)}
                            endEffectorsLabels={endEffectorsConfig.map(effector => effector.label)}
                            setSelected={setSelectedPos}
                            isActive={position.name == selectedPos ? true : false} />
                    ))}
                    {

                    }
                </div>
            </CustomScroll>

            <div className='flex flex-col p-4 gap-3 border-t'
                style={{ borderColor: colors.border, color: colors.text.primary }}>
                {selectedPos !== ""
                    ? <div className='flex flex-row justify-between gap-3 '>
                        {/* <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}1A` }}
                            onClick={handleEditing}>
                            <EditIcon />
                            <p>Editar</p>
                        </button> */}
                        {/* <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.danger, color: colors.danger, backgroundColor: `${colors.danger}1A` }}
                            onClick={handleDelete}>
                            <DeleteIcon />
                            <p>Borrar</p>
                        </button> */}
                        <HollowButton
                            color={colors.primary}
                            borderColor={colors.primary}
                            bgColor={colors.primary}
                            IconComponent={EditIcon}
                            text="Editar"
                            onClick={handleEditing}
                        />
                        <HollowButton
                            color={colors.danger}
                            borderColor={colors.danger}
                            bgColor={colors.danger}
                            IconComponent={DeleteIcon}
                            text="Borrar"
                            onClick={handleDelete}
                        />
                    </div>
                    : null}
                <div className='flex w-full'
                    style={{ borderColor: colors.border, color: colors.text.primary }}>
                    {/* <button className='button flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                        style={{ borderColor: colors.border }}
                        onClick={handleSaving}>
                        <SaveIcon />
                        <p>Guardar nueva pose</p>
                    </button> */}
                    <HollowButton
                        color={colors.text.primary}
                        borderColor={colors.disabled}
                        bgColor={colors.background}
                        IconComponent={SaveIcon}
                        text="Guardar nueva pose"
                        onClick={handleSaving}
                    />
                </div>
                {selectedPos !== ""
                    // ? <div className='flex text-white'>
                    //     <button className={`${isPlaying ? 'opacity-70' : 'button'} flex flex-1 p-2 justify-center gap-3 rounded-md`}
                    //         style={{ backgroundColor: colors.primaryDark }}
                    //         onClick={isPlaying ? () => { } : sendPos}>
                    //         {isPlaying
                    //             ? <>
                    //                 <LoadingIndicator />
                    //                 <p>Reproduciendo movimiento</p>
                    //             </>
                    //             : <>
                    //                 <PlayArrowRoundedIcon />
                    //                 <p>Reproducir movimiento</p>
                    //             </>}

                    //     </button>
                    // </div>
                    ?
                    <SolidButton 
                        bgColor={colors.primaryDark}
                        color={"white"}
                        borderColor={colors.primaryDark}
                        text={isPlaying ? "Reproduciendo movimiento" : "Reproducir movimiento"}
                        IconComponent={isPlaying ? LoadingIndicator : PlayArrowRoundedIcon}
                        onClick={isPlaying ? () => { } : sendPos}
                        disabled={isPlaying}
                    />
                    : null}
            </div>
            <SavePosModal
                isOpen={showSavePopUp}
                setIsOpen={setShowSavePopUp} />
            <EditPosModal
                isOpen={showEditPopUp}
                setIsOpen={setShowEditPopUp}
                selectedPos={selectedPos} />
            {popUp && (
                <PopUp
                    open
                    type={popUp.type}
                    title={popUp.title}
                    message={popUp.message}
                    onConfirm={popUp.onConfirm}
                    onCancel={popUp.onCancel}
                />
            )}
        </div>
    )
}

export default Positions
