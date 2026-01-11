import { useTheme } from "../../../context/ThemeContext"
import { useState } from "react"
import { useWebSocket } from "../../../context/WebSocketContext"
import { useRobotState } from "../../../context/RobotState"
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import UnderlinedInput from "../../ui/inputs/underlinedInput";
import Modal from "./Modal";

function SavePosModal({ isOpen, setIsOpen }) {
    if (isOpen != true) return null
    const { savePos } = useWebSocket()
    const [name, setName] = useState("")
    const { colors } = useTheme()

    const state = useRobotState()
    const joints = state.robotState.joints
    const jointConfig = state.robotConfig.joints
    const endEffectors = state.robotState.endEffectors
    const endEffectorsConfig = state.robotConfig.end_effectors

    const [showRequeriedName, setShowRequiredName] = useState(false)
    const handleConfirm = () => {
        // [ ] Añadir feedback
        if (name === "") {
            setShowRequiredName(true)
            return
        }
        setShowRequiredName(false)
        savePos(name, joints, endEffectors)
        setIsOpen(false)
    }
    return (
        <Modal
            onClose={() =>  setIsOpen(false) }>
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
                        <UnderlinedInput
                            value={name}
                            placeholder="Ingresa el nombre"
                            unselectedColor={showRequeriedName ? colors.danger : colors.border}
                            selectedColor={colors.primary}
                            onChange={(e) => { setName(e.target.value) }}
                            className="w-full py-1"
                            style={showRequeriedName ? { borderColor: colors.danger } : { borderColor: colors.border }}
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

                <div className="flex flex-row flex-wrap w-full gap-2 text-sm" >
                    {jointConfig.map((joint, i) => (
                        <div key={joint.id} className="flex flex-1 min-w-[25%] flex-row p-2 rounded-md border-1 justify-center"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                            <div className="flex  flex-col justify-center gap-1">
                                <p className='text-center font-bold'
                                    style={{ color: colors.text.title }}>{joint.label}</p>
                                <p className='text-center font-bold'
                                    style={{ color: colors.primary }}> {joints[i]}{joint.unit === "%" ? "%" : "°"}</p>
                            </div>
                        </div>
                    ))}
                    {endEffectorsConfig.map((effector, i) => (
                        <div key={effector.id} className="flex flex-1 min-w-[25%] flex-row p-2 rounded-md border-1 justify-center"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                            <div className="flex  flex-col justify-center gap-1">
                                <p className='text-center font-bold'
                                    style={{ color: colors.text.title }}>{effector.label}</p>
                                <p className='text-center font-bold'
                                    style={{ color: colors.primary }}> {endEffectors[i]}{effector.unit === "%" ? "%" : "°"}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-lg text-white">
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.dangerDark }}
                        onClick={() => { setIsOpen(false) }}>
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
        </Modal>
    )
}

export default SavePosModal
