import { useTheme } from "../context/ThemeContext"
import { useState } from "react"
import { useWebSocket } from "../context/WebSocketContext"
import { useRobotState } from "../context/RobotState"
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

function SavePosModal({ isOpen, setIsOpen }) {

    if (isOpen != true) return null
    const { savePos } = useWebSocket()
    const [name, setName] = useState("")
    const { colors } = useTheme()
    const { joints, jointConfig } = useRobotState()
    const [showRequeriedName, setShowRequiredName] = useState(false)
    const handleConfirm = () => {
        // [ ] Añadir feedback
        if (name === "") {
            setShowRequiredName(true)
            return
        }
        setShowRequiredName(false)
        savePos(name)
        setIsOpen(false)
    }
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000'
            onClick={() => { setIsOpen(false) }}>
            <div className='w-[360px] rounded-lg p-4 flex flex-col gap-5'
                style={{ backgroundColor: colors.background, color: colors.text.primary }}
                onClick={(e) => e.stopPropagation()}>
                <div>
                    <p className="text-xl font-bold"
                        style={{ color: colors.text.title }}>Nueva posición</p>
                </div>
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-row flex-wrap gap-3 justify-between ">
                    {jointConfig.map((joint, i) => (
                        <div className="rounded-md py-1 px-3"
                            style={{ color: colors.text.primary, border: '1px solid', borderColor: colors.border }}
                            key={joint.id}>
                            <p  >{joint.label}: {joints[i]}{joint.unit === "%" ? "%" : "°"}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-lg text-white">
                    <button className='flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.danger, border: '1px solid', borderColor: colors.border }}
                        onClick={() => { setIsOpen(false) }}>
                        <CloseIcon />

                        Cancelar
                    </button>
                    <button className='flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
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

export default SavePosModal
