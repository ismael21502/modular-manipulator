import { useTheme } from "../context/ThemeContext"
import { useEffect, useState } from "react"
import { useWebSocket } from "../context/WebSocketContext"
import { useRobotState } from "../context/RobotState"
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import * as Slider from "@radix-ui/react-slider";
import validateNumber from "../utils/validate";

function EditPosPopUp({ isOpen, setIsopen, selectedPos }) {
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
                        <div className="relative group">
                            <input type="text" placeholder="Ingresa el nombre" className="w-full p-2 border-b-1 outline-none"
                                style={{ borderColor: showRequeriedName ? colors.danger : colors.border }}
                                value={name}
                                onChange={(e) => { setName(e.target.value) }} />
                            <span className="absolute left-0 bottom-0 h-0.5 w-0 transition-all duration-300 group-focus-within:w-full"
                                style={{ backgroundColor: colors.primary }}
                            ></span>
                        </div>
                        

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
                        // <div className="rounded-md py-1 px-3"
                        //     style={{ color: colors.text.primary, border: '1px solid', borderColor: colors.border }}
                        //     key={joint.id}>
                        //     <p  >{joint.label}: {joints[i]}{joint.unit === "%" ? "%" : "°"}</p>
                        // </div>
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
                                            style={{ backgroundColor: colors.primaryDark }} />
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
                    <button className='button flex py-1 px-4 gap-2 items-center rounded-md cursor-pointer text-bold'
                        style={{ backgroundColor: colors.dangerDark }}
                        onClick={() => { setIsopen(false) }}>
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

export default EditPosPopUp
