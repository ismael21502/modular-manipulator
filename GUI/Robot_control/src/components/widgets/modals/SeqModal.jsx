import React from 'react'
import { useWebSocket } from '../../../context/WebSocketContext'
import { useState } from 'react'
import { useRobotState } from '../../../context/RobotState'
import { useTheme } from '../../../context/ThemeContext'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomScroll from '../../ui/scrolls/CustomScroll'
import validateNumber from '../../../utils/validate'
import UnderlinedInput from '../../ui/inputs/underlinedInput'
import InputWithSuffix from '../../ui/inputs/InputWithSuffix'

// function SaveSeqModal({ isOpen, setIsOpen, steps, onConfirm, mode, seqName }) {
function SeqModal({ onConfirm, sequence, mode, onClose }) {
    const { saveSeq, updateSeq } = useWebSocket()
    const { jointConfig } = useRobotState()
    const [name, setName] = useState(sequence.name || "")
    const { colors } = useTheme()
    const [showRequeriedName, setShowRequiredName] = useState(false)
    const [localSteps, setLocalSteps] = useState(sequence.steps || [])

    const title = mode === "edit" ? "Editar secuencia" : "Nueva secuencia"

    const handleConfirm = async () => {
        // [ ] Añadir feedback
        if (name === "") {
            setShowRequiredName(true)
            return
        }
        setShowRequiredName(false)
        let serverResponse = null
        if (mode === "edit") {
            serverResponse = await updateSeq(sequence.name, name, localSteps)
        } else {
            serverResponse = await saveSeq(name, localSteps)
        }
        // const serverResponse = await saveSeq(name, localSteps)
        if (serverResponse.status === "ok") {
            onClose()
            onConfirm()
        } else {
            onClose()
            //Revisar si hay errores
        }
    }

    const validateTimeInputs = (text) => {
        if (text === "") return 0
        return parseInt(text)
    }

    const deleteStep = (index) => {
        setLocalSteps(prev => {
            const updated = [...prev]
            updated.splice(index, 1)
            return updated
        })
    }
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000 '
            onClick={() => onClose()}>
            <div className='w-[480px] h-[90%] rounded-lg flex flex-col'
                style={{ backgroundColor: colors.background, color: colors.text.primary }}
                onClick={(e) => e.stopPropagation()}>
                <div className='p-4 pb-0'>
                    <p className="text-xl font-bold"
                        style={{ color: colors.text.title }}>{title}</p>
                </div>
                <div className="flex flex-col gap-2 p-4 border-b-1"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-row gap-5 items-center">
                        <p>Nombre</p>
                        <UnderlinedInput
                            value={name}
                            placeholder="Ingresa el nombre"
                            unselectedColor={showRequeriedName ? colors.danger : colors.border}
                            selectedColor={colors.primary}
                            onChange={(e) => { setName(e.target.value) }}
                            className="w-full p-2"
                        />
                    </div>
                    {showRequeriedName
                        ? <div className="flex flex-row gap-2 items-center"
                            style={{ color: colors.danger }}>
                            <InfoOutlineIcon fontSize="small" />
                            <p>Ingresa un nombre</p>
                        </div>
                        : null}
                </div>

                <CustomScroll scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                        <p style={{ color: colors.text.title, fontWeight: 'bold' }}>
                            PASOS DE LA SECUENCIA
                        </p>
                        {localSteps.map((step, i) => (
                            <div className='flex flex-col gap-3 rounded-md p-3 border-1' key={i}
                                style={{ borderColor: colors.border, backgroundColor: `${colors.primary}1A` }}>
                                {/* <p style={{color: colors.text.title, fontWeight: 'bold'}}>{step.label}</p> */}
                                <div className="flex flex-row gap-4 items-center">
                                    <p style={{ color: colors.primary }}>#{i + 1}</p>
                                    <UnderlinedInput
                                        value={step.label}
                                        placeholder="Nombre"
                                        unselectedColor={showRequeriedName ? colors.danger : colors.border}
                                        selectedColor={colors.primary}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                updated[i] = { ...updated[i], label: e.target.value }
                                                return updated
                                            })
                                        }}
                                        className="w-full py-1 font-bold"
                                    />
                                    <DeleteIcon fontSize='small' className='button cursor-pointer'
                                        style={{ color: colors.disabled }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                                        onMouseLeave={(e) => e.currentTarget.style.color = colors.disabled}
                                        onClick={() => deleteStep(i)}
                                    />
                                </div>
                                <div className="flex flex-row flex-wrap w-full gap-2 text-sm" >
                                    {jointConfig.map((joint, j) => (
                                        <div key={joint.id} className="flex flex-1 min-w-[25%] flex-row p-2 rounded-md border-1 justify-center"
                                            style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                                            <div className="flex  flex-col justify-center gap-1">
                                                <p className='text-center'
                                                    style={{ color: colors.text.title }}>{joint.label}</p>                                                
                                                <div className="flex w-full flex-row justify-center">
                                                    <input type='text' value={step.joints[j]}
                                                        onChange={(e) => {
                                                            const val = validateNumber(e.target.value, joint.min, joint.max)
                                                            if (val === undefined) return  // ignorar caracteres inválidos
                                                            setLocalSteps(prev => {
                                                                const updated = [...prev]
                                                                updated[i] = {
                                                                    ...updated[i],
                                                                    joints: {
                                                                        ...updated[i].joints,
                                                                        [j]: val
                                                                    }
                                                                }
                                                                return updated
                                                            })
                                                        }}
                                                        className='text-end font-bold outline-none'
                                                        style={{ color: colors.primary, width: `${Math.max((step.joints[j] ?? 0).toString().length, 1)}ch` }}
                                                        onBlur={() => {
                                                            if (step.joints[j] === "-") setLocalSteps(prev => {
                                                                const updated = [...prev]
                                                                updated[i] = { ...updated[i], joints: { ...updated[i].joints, [j]: joint.default } }
                                                                return updated
                                                            })
                                                        }} />
                                                    <span style={{ fontWeight: 'bold', color: colors.primary }}>{joint.unit === "%" ? "%" : "°"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-row items-center gap-2 text-sm">
                                    <p>Duración: </p>
                                    <InputWithSuffix
                                        className='rounded-sm px-2 py-1'
                                        value={localSteps[i].duration}
                                        suffix={"ms"}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                // Poner validaciones aquí
                                                updated[i] = { ...updated[i], duration: validateTimeInputs(e.target.value) }
                                                return updated
                                            })
                                        }}
                                        style={{ backgroundColor: colors.background }}
                                    />
                                    <p>Pausa: </p>
                                    <InputWithSuffix
                                        className='rounded-sm px-2 py-1'
                                        value={localSteps[i].delay}
                                        suffix={"ms"}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                // Poner validaciones aquí
                                                updated[i] = { ...updated[i], delay: validateTimeInputs(e.target.value) }
                                                return updated
                                            })
                                        }}
                                        style={{ backgroundColor: colors.background }}
                                    />
                                    {/* <p>ms</p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </CustomScroll>
                <div className="flex justify-between text-lg text-white p-4 border-t-1"
                    style={{ borderColor: colors.border }}>
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.dangerDark }}
                        onClick={onClose}>
                        <CloseIcon />
                        Cancelar
                    </button>
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.primary }}
                        onClick={handleConfirm}>
                        <CheckIcon />
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SeqModal