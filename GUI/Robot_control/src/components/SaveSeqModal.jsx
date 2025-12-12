import React from 'react'
import { useWebSocket } from '../context/WebSocketContext'
import { useState } from 'react'
import { useRobotState } from '../context/RobotState'
import { useTheme } from '../context/ThemeContext'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomScroll from './CustomScroll'

function SaveSeqModal({ isOpen, setIsOpen, steps, onConfirm }) {
    if (isOpen != true) return null
    const { saveSeq } = useWebSocket()
    const { jointConfig } = useRobotState()
    const [name, setName] = useState("")
    const { colors } = useTheme()
    const [showRequeriedName, setShowRequiredName] = useState(false)
    const [localSteps, setLocalSteps] = useState(steps.map(step => (step)))

    const handleConfirm = async () => {
        // [ ] Añadir feedback
        if (name === "") {
            setShowRequiredName(true)
            return
        }
        setShowRequiredName(false)
        const serverResponse = await saveSeq(name, localSteps)
        if (serverResponse.status === "ok") {
            setIsOpen(false)
            onConfirm()
        } else {
            setIsOpen(false)
            //Revisar si hay errores
        }
    }

    const validateTimeInputs = (text) =>{
        if(text === "") return 0
        return parseInt(text)
    }
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000 '
            onClick={() => { setIsOpen(false) }}>
            <div className='w-[480px] h-[90%] rounded-lg flex flex-col'
                style={{ backgroundColor: colors.background, color: colors.text.primary }}
                onClick={(e) => e.stopPropagation()}>
                <div className='p-4 pb-0'>
                    <p className="text-xl font-bold"
                        style={{ color: colors.text.title }}>Nueva secuencia</p>
                </div>
                <div className="flex flex-col gap-2 p-4 border-b-1"
                style={{borderColor: colors.border}}>
                    <div className="flex flex-row gap-5 items-center">
                        <p>Nombre</p>
                        <input type="text" placeholder="Ingresa el nombre" className="w-full p-2 border-b-1"
                            style={{ borderColor: showRequeriedName ? colors.danger : colors.border }}
                            value={name}
                            onChange={(e) => { setName(e.target.value) }} />
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
                        {steps.map((step, i) => (
                            <div className='flex flex-col gap-3 rounded-md p-3 border-1' key={i}
                                style={{ borderColor: colors.border, backgroundColor: `${colors.primary}1A` }}>
                                {/* <p style={{color: colors.text.title, fontWeight: 'bold'}}>{step.label}</p> */}

                                <div className="flex flex-row gap-4 items-center">
                                    <p style={{ color: colors.primary }}>#{i + 1}</p>
                                    <input type="text" placeholder="Nombre" className="w-full pr-2 py-1 border-b-1 font-bold"
                                        style={{ borderColor: colors.border }}
                                        value={localSteps[i].label}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                updated[i] = { ...updated[i], label: e.target.value }
                                                return updated
                                            })
                                        }} />
                                    <DeleteIcon fontSize='small' className='button cursor-pointer'
                                        color={colors.disabled}
                                        onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                                        onMouseLeave={(e) => e.currentTarget.style.color = colors.disabled}
                                    />
                                </div>
                                <div className="flex flex-row flex-wrap w-full gap-2 text-sm" >
                                    {jointConfig.map((joint, i) => (
                                        <div key={joint.id} className="flex flex-1 min-w-[25%] flex-row p-2 rounded-md border-1 justify-center"
                                            style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                                            <div className="flex  flex-col justify-center gap-1">
                                                <p className='text-center'
                                                    style={{ color: colors.text.title }}>{joint.label}</p>
                                                <p className='text-center font-bold'
                                                    style={{ color: colors.primary }}> {step.joints[i]}{joint.unit === "%" ? "%" : "°"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-row items-center gap-2 text-sm">
                                    <p>Duración: </p>
                                    <input type="text" placeholder="Duración" className="px-2 py-1 w-15 border-1 rounded-md"
                                        // style={{ borderColor: showRequeriedName ? colors.danger : colors.border }}
                                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                        value={localSteps[i].duration}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                // Poner validaciones aquí
                                                updated[i] = { ...updated[i], duration: validateTimeInputs(e.target.value) }
                                                return updated
                                            })
                                        }} />
                                    {/* <p>ms</p> */}
                                    <p>Pausa: </p>
                                    <input type="text" placeholder="Pausa" className="px-2 py-1 w-15 border-1 rounded-md"
                                        // style={{ borderColor: showRequeriedName ? colors.danger : colors.border }}
                                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                        value={localSteps[i].delay}
                                        onChange={(e) => {
                                            setLocalSteps(prev => {
                                                const updated = [...prev]
                                                // Poner validaciones aquí
                                                updated[i] = { ...updated[i], delay: validateTimeInputs(e.target.value) }
                                                return updated
                                            })
                                        }} />
                                    {/* <p>ms</p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </CustomScroll>
                <div className="flex justify-between text-lg text-white p-4 border-t-1"
                style={{borderColor: colors.border}}>
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.dangerDark }}
                        onClick={() => { setIsOpen(false) }}>
                        <CloseIcon />
                        Cancelar
                    </button>
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.primaryDark }}
                        onClick={handleConfirm}>
                        <CheckIcon />
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SaveSeqModal