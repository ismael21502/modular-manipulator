import React, { useState, useEffect, useRef } from 'react'
import * as Slider from "@radix-ui/react-slider";
import { useTheme } from '../../../context/themes/ThemeContext';
import BackHandIcon from '@mui/icons-material/BackHand';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRobotState } from '../../../context/RobotState';
import validateNumber from '../../../utils/validate';
import HandymanIcon from '@mui/icons-material/Handyman';
import { useWebSocket } from '../../../context/WebSocketContext';

function Gripper({ }) {
    const { colors } = useTheme()
    const { throttledSend } = useWebSocket()
    const state = useRobotState()
    const endEffectors = state.robotState.endEffectors
    const setEndEffector = state.robotApi.setEndEffector
    const endEffectorsConfig = state.robotConfig.end_effectors

    const [tempValues, setTempValues] = useState(
        endEffectorsConfig.map(effector => effector.default)
    )

    useEffect(() => {
        setTempValues(endEffectors)
    }, [endEffectors])

    const handleChangeInput = (i, val, min, max) => {
        const newVal = validateNumber(val, min, max)
        if (newVal === undefined) return
        setTempValues((prev) => {
            const newValues = [...prev]
            newValues[i] = newVal
            return newValues
        })
    }
    // const handleChangeInput = (val, min, max) => {
    //     const newVal = validateNumber(val, min, max)
    //     if (newVal === undefined) return
    //     setTempValues([newVal])
    // }

    const handleChangeSlider = (i, val) => {
        setVal(i, val[0])
    }

    const setVal = (i, val) => {
        setEndEffector(i,val)
        const newVals = [...endEffectors]
        newVals[i] = val
        throttledSend("end_effectors_move", newVals)
    }
    
    const commitVal = (i, val, min, max) => {
        const valid = validateNumber(val, min, max)
        if (valid === undefined) return
        setVal(i, valid)
    }

    return (
        <div className='flex flex-col flex-1 py-2'
            style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
            <div className='flex flex-row gap-2 items-center font-bold py-2 px-5 text-md'>
                {/* <BackHandIcon fontSize='small' /> */}
                <HandymanIcon fontSize='small' />
                <p>Herramientas</p>
            </div>
            <div className="flex flex-col py-2 px-5 w-full justify-between gap-6">
                {endEffectorsConfig.map((effector, i) => (
                    <div key={effector.id} className="flex flex-col items-center gap-2">
                        <div className="flex flex-row w-full justify-between text-sm ">
                            <h3 className="text-center">{effector.label}</h3>
                            <div className="flex items-start">
                                <input
                                    type="text"
                                    className="mb-3 w-[2.5rem] text-end outline-none"
                                    value={tempValues[i] ?? ""}
                                    onChange={(e) => handleChangeInput(i, e.target.value, effector.min, effector.max)}
                                    onBlur={(e) => {
                                        if (e.target.value === "-") {
                                            commitVal(i, effector.default, effector.min, effector.max)
                                        } else {
                                            commitVal(i, e.target.value, effector.min, effector.max)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            commitVal(i, e.target.value !== '-' ? e.target.value : effector.default, effector.min, effector.max)
                                            // e.target.blur()
                                        }
                                    }}
                                />

                                <span>{effector.unit}</span>
                            </div>
                        </div>

                        <div className='flex flex-row items-center gap-5 w-full'>
                            <LockOpenOutlinedIcon fontSize='small' />
                            <Slider.Root
                                className="relative flex items-center justify-center select-none touch-none h-1 w-full"
                                min={effector.min}
                                max={effector.max}
                                step={1}
                                onValueChange={(val) => handleChangeSlider(i, val)}
                                value={[tempValues[i] === '-' ? effector.default : tempValues[i]]}
                            >
                                <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                                    style={{ backgroundColor: colors.border }}>
                                    <Slider.Range className={`absolute rounded-full h-full h-full ${tempValues[i] === endEffectors[i] ? '' : 'opacity-0'}`}
                                        style={{ backgroundColor: colors.primary }} />
                                </Slider.Track>
                                <Slider.Thumb className="block w-4 h-4 rounded-full outline-none hover:cursor-pointer"
                                    style={{
                                        backgroundColor: colors.primary,
                                        outline: tempValues[i] === endEffectors[i] ? 'none' : `2px dashed ${colors.primary}`,
                                        outlineOffset: tempValues[i] === endEffectors[i] ? 0 : 2,
                                    }} />
                            </Slider.Root>
                            <LockOutlinedIcon fontSize='small'/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Gripper
