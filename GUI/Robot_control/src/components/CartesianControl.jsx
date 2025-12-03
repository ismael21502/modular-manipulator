import React, { useEffect, useState } from 'react'
import * as Slider from "@radix-ui/react-slider";
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { useTheme } from '../context/ThemeContext';
import { useRobotState } from '../context/RobotState';
function CartesianControl() {
    const { colors } = useTheme()
    // const [tempCoords, setTempCoords] = useState({ X: "0", Y: "0", Z: "0" });

    const { cartesian, setCartesian, cartesianConfig } = useRobotState()
    useEffect(() => {
        console.log("C Config: ", cartesianConfig)
    }, [])
    const handleChange = (axis, i, input) => {
        const axisId = axis.id
        let newValue = Array.isArray(input) ? input[0] : parseFloat(input)
        if (isNaN(newValue)) newValue = 0

        // Limitar rango según config
        if (newValue > axis.max) newValue = axis.max
        if (newValue < axis.min) newValue = axis.min

        setCartesian(prev => {
            const newCartesian = [...prev]
            newCartesian[i] = newValue
            return newCartesian
        })
        // setTempCoords(prev => ({ ...prev, [axisId]: newValue.toString() }))

        // // Enviar por websocket
        // if (ws?.current)
        //     ws.current.send(JSON.stringify({ type: "cartesian", data: newCoords }))
    }

    // const handleKeyDown = (axis, e) => {
    //     if (e.key === "Enter") {
    //         handleChange(axis, i, tempCoords[axis.id])
    //     }
    // }

    const axes = { "X": "Lateral", "Y": "Profundidad", "Z": "Vertical" };
    return (
        <div className='flex flex-1 flex-col'
            style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
            <div className='flex flex-row w-full py-2 px-5 gap-2 font-bold text-md'>
                <OpenWithIcon />
                <p>CONTROL CARTESIANO</p>
            </div>
            <div className="flex flex-col gap-4 py-2 px-5 w-full">
                {/* {cartesianConfig.map((axis, i) => (
                    axis.id == "roll" || axis.id == "pitch" || axis.id == "yaw" ? null : <div>{axis.label}</div>
                ))} */}
                {cartesianConfig.map((axis, i) => (
                    axis.id == "roll" || axis.id == "pitch" || axis.id == "yaw" ? null :
                        <div className='flex flex-col items-center' key={axis.id}>
                            <div className='flex flex-row w-full justify-between text-sm'>
                                <h3 className='text-center'>{axis.label} </h3>
                                <div >
                                    <input type='text' className='w-[3rem] text-end mr-2'
                                        value={cartesian[i]}
                                        onChange={(e) => handleChange(axis, i, e.target.value)}
                                        // onKeyDown={(e) => handleKeyDown(axis, i, e)} 
                                        />
                                    <span>{axis.unit}</span>
                                </div>
                            </div>
                            <Slider.Root
                                className="relative flex items-center justify-center select-none touch-none h-8 w-full"
                                defaultValue={axis.default}
                                min={axis.min}
                                max={axis.max}
                                step={1}
                                onValueChange={(val) => handleChange(axis, i, val)}
                                value={[cartesian[i]]}
                            >
                                <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                                    style={{ backgroundColor: colors.border }}>
                                    <Slider.Range className="absolute rounded-full h-full"
                                        style={{ backgroundColor: colors.axes[axis.id] }} />
                                </Slider.Track>
                                <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer"
                                    style={{ backgroundColor: colors.axes[axis.id] }} />
                            </Slider.Root>
                        </div>
                ))}
            </div>
        </div>
    )
}

export default CartesianControl
