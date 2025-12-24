import { useTheme } from "../../../context/ThemeContext"
import { useEffect, useState } from "react"
import { useWebSocket } from "../../../context/WebSocketContext"
import { useRobotState } from "../../../context/RobotState"
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import * as Slider from "@radix-ui/react-slider";
import validateNumber from "../../../utils/validate";
import UnderlinedInput from "../../ui/inputs/underlinedInput";

function EditPosModal({ isOpen, setIsopen, selectedPos }) {
    if (isOpen != true) return null
    const { positions, updatePos } = useWebSocket()
    const oldName = selectedPos
    const [name, setName] = useState(oldName)
    const { colors } = useTheme()
    const { jointConfig } = useRobotState()
    const [showRequeriedName, setShowRequiredName] = useState(false)
    const prevValues = positions.find(pos => pos.name === selectedPos).values
    const [values, setValues] = useState([...prevValues])
    const handleConfirm = () => {
        if (name === "") {
            setShowRequiredName(true)
            return
        }
        values.forEach(val => {
            if (!Number.isFinite(val)) {
                return
            }
        })
        setShowRequiredName(false)
        updatePos(oldName, name, values)
        setIsopen(false)
    }
    
    const handleChangeVal = (i,val,min,max) => {
        const newVal = validateNumber(val,min,max)
        if(newVal === undefined) return
        setValues(prev => {
            const newVals = [...prev]
            newVals[i] = newVal
            return newVals
        })
    }
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000'
            onClick={() => { setIsopen(false) }}>
            <div className='w-[360px] max-h-[85%] overflow-y-auto rounded-lg p-4 flex flex-col gap-5'
                style={{ backgroundColor: colors.background, color: colors.text.primary }}
                onClick={(e) => e.stopPropagation()}>
                <div>
                    <p className="text-xl font-bold"
                        style={{ color: colors.text.title }}>Editar posición</p>
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
                <div className="flex flex-row flex-wrap gap-3 justify-between ">
                    {jointConfig.map((joint, i) => (
                        <div key={joint.id} className="flex flex-col w-full gap-2">
                            <div className="flex justify-between ">
                                <p>{joint.label}</p>
                                <div style={{color: colors.primary, fontWeight: 'bold'}}>
                                    <input type="text" value={values[i]} className="w-10 text-end ml-2 outline-none" onChange={(e) => { handleChangeVal(i, e.target.value, joint.min, joint.max) }} />
                                    <span>{joint.unit == "deg" ? "°" : "%"}</span>
                                </div>
                            </div>
                            <div className="flex flex-row w-full items-center gap-2">
                                <p className="text-sm" style={{ color: colors.text.secondary }}>{joint.min}{joint.unit === "deg"? "°": "%"}</p>
                                <Slider.Root
                                    className="relative flex items-center justify-center select-none touch-none h-1 w-full"
                                    min={joint.min}
                                    max={joint.max}
                                    step={1}
                                    onValueChange={(val) => {handleChangeVal(i, val, joint.min, joint.max)}}
                                    value={[values[i]]}
                                >
                                    <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                                        style={{ backgroundColor: colors.border }}>
                                        <Slider.Range className="absolute rounded-full h-full h-full"
                                            style={{ backgroundColor: colors.primary }} />
                                    </Slider.Track>
                                    <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer"
                                        style={{ backgroundColor: colors.primary }} />
                                </Slider.Root>
                                <p className="text-sm" style={{ color: colors.text.secondary }}>{joint.max}{joint.unit === "deg" ? "°" : "%"}</p>
                            </div>
                            {/* <div className="flex flex-row gap-3">
                                <p>Min: {joint.min}</p>
                                <p>Max: {joint.max}</p>
                            </div> */}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-lg text-white">
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md'
                        style={{ backgroundColor: colors.dangerDark }}
                        onClick={() => { setIsopen(false) }}>
                        <CloseIcon />
                        Cancelar
                    </button>
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md'
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

export default EditPosModal
