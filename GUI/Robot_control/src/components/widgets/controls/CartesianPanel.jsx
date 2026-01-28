import React, { useEffect, useState } from 'react'
import * as Slider from "@radix-ui/react-slider";
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { useTheme } from '../../../context/themes/ThemeContext';
import { useRobotState } from '../../../context/RobotState';
import { useWebSocket } from '../../../context/WebSocketContext';
import { debounce } from 'lodash'
import validateNumber from '../../../utils/validate';
 
function CartesianControl() {
    const { colors } = useTheme()
    // const [tempCoords, setTempCoords] = useState({ X: "0", Y: "0", Z: "0" });
    const { throttledSend } = useWebSocket()
    const { cartesian, setCartesian, cartesianConfig, isPlaying } = useRobotState()

    const [tempValues, setTempValues] = useState(cartesianConfig.map(axis => {
        return axis.default
    }))

    useEffect(() => {
        setTempValues(cartesian)
    }, [cartesian])

    const handleChangeSlider = (i, val) => {
        setVal(i, val[0])
    }

    const handleChangeInput = (i, val, min, max) => {
        const newVal = validateNumber(val, min, max)
        if (newVal === undefined) return
        setTempValues((prev) => {
            const newValues = [...prev]
            newValues[i] = newVal
            return newValues
        })
        // setVal(i, newVal)
    }

    const setVal = (i, val) => {
        setCartesian(prev => {
            const newVals = [...prev]
            newVals[i] = val
            throttledSend("cartesian_move", newVals)
            return newVals
        })
    }

    const commitVal = (i, val, min, max) => {
        const valid = validateNumber(val, min, max)
        if (valid === undefined) return
        setVal(i, valid)
    }

    return (
        <div className='flex flex-1 flex-col py-2'
            style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
            <div className='flex flex-row w-full py-2 px-5 gap-2 font-bold text-md'>
                <OpenWithIcon />
                <p>CONTROL CARTESIANO</p>
            </div>
            <div className="flex flex-col gap-4 py-2 px-5 w-full gap-6">
                {/* {cartesianConfig.map((axis, i) => (
                    axis.id == "roll" || axis.id == "pitch" || axis.id == "yaw" ? null : <div>{axis.label}</div>
                ))} */}
                {cartesianConfig.map((axis, i) => (
                    axis.id == "roll" || axis.id == "pitch" || axis.id == "yaw" ? null :
                        <div className='flex flex-col items-center gap-3' key={axis.id}>
                            <div className='flex flex-row w-full justify-between text-sm'>
                                <h3 className='text-center'>{axis.label} </h3>
                                <div >
                                    <input type='text' className='w-[3rem] text-end mr-2 outline-none'
                                        value={tempValues[i] ?? ""}
                                        onChange={(e) => handleChangeInput(i, e.target.value, axis.min, axis.max)}
                                        // onKeyDown={(e) => handleKeyDown(axis, i, e)} 
                                        onBlur={(e) => {
                                            if (e.target.value === "-") {
                                                commitVal(i, axis.default, axis.min, axis.max)
                                            } else {
                                                commitVal(i, e.target.value, axis.min, axis.max)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                commitVal(i, e.target.value !== '-' ? e.target.value : axis.default, axis.min, axis.max)
                                            }
                                        }}
                                    />
                                    <span>{axis.unit}</span>
                                </div>
                            </div>
                            <Slider.Root
                                className="relative flex items-center justify-center select-none touch-none h-1 w-full"
                                defaultValue={axis.default}
                                min={axis.min}
                                max={axis.max}
                                step={1}
                                onValueChange={(val) => handleChangeSlider(i, val, axis)}
                                value={[tempValues[i] === '-' ? axis.default : tempValues[i]]}
                            >
                                <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                                    style={{ backgroundColor: colors.border }}>
                                    <Slider.Range className={`absolute rounded-full h-full ${tempValues[i] === cartesian[i] ? '' : 'opacity-0'}`}
                                        style={{ backgroundColor: colors.axes[axis.id] }} />
                                </Slider.Track>
                                <Slider.Thumb className="block w-4 h-4 rounded-full outline-none hover:cursor-pointer"
                                    style={{
                                        backgroundColor: colors.axes[axis.id],
                                        outline: tempValues[i] === cartesian[i] ? 'none' : `2px dashed ${colors.axes[axis.id]}`,
                                        outlineOffset: tempValues[i] === cartesian[i] ? 0 : 2,
                                    }} />
                            </Slider.Root>
                        </div>
                ))}
            </div>
        </div>
    )
}

export default CartesianControl
