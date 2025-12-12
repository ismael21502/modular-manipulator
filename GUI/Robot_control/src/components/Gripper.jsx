import React, { useState, useEffect, useRef } from 'react'
import * as Slider from "@radix-ui/react-slider";
import { useTheme } from '../context/ThemeContext';
import BackHandIcon from '@mui/icons-material/BackHand';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRobotState } from '../context/RobotState';
import validateNumber from '../utils/validate';

function Gripper({ }) {
    const { colors } = useTheme()
    const { joints, jointConfig, setJoints } = useRobotState()
    const gripperIndex = joints.length - 1
    const opening = joints[gripperIndex]
    const handleChangeVal = (val, min, max) => {
        const newVal = validateNumber(val, min, max)
        if (newVal === undefined) return
        setJoints(prev => {
            const newJoints = [...prev]
            newJoints[gripperIndex] = newVal
            return newJoints
        })
    }
    const handleChangeOpening = (val) => {
        setJoints(prev => {
            const newJoints = [...prev]
            newJoints[gripperIndex] = val[0]
            return newJoints

        })
    }
    return (
        <div className='flex flex-col flex-1 py-2'
            style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
            <div className='flex flex-row justify-between w-full py-2 px-5 text-md'>
                <div className='flex flex-row gap-2 items-center font-bold'>
                    <BackHandIcon fontSize='small' />
                    <p>PINZA</p>
                </div>
                <div className="flex items-center gap-1 text-sm"
                    style={{}}>
                    <input type='text' className='w-[2rem] text-end' value={opening} onChange={(e) => handleChangeVal(e.target.value, jointConfig[gripperIndex].min, jointConfig[gripperIndex].max)} />
                    <span>{jointConfig[gripperIndex].unit}</span>
                </div>
            </div>
            <div className="flex flex-col gap-4 py-2 px-5 w-full">
                <div className='flex flex-row items-center gap-5'> {/* Slider */}
                    <LockOpenOutlinedIcon fontSize='small' />
                    <Slider.Root
                        className="relative flex items-center justify-center select-none touch-none h-1 w-full"
                        defaultValue={[jointConfig[gripperIndex].default]}
                        min={jointConfig[gripperIndex].min}
                        max={jointConfig[gripperIndex].max}
                        step={1}
                        value={[opening]}
                        onValueChange={handleChangeOpening}
                    >
                        <Slider.Track className="bg-[#2B2B2B] relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                            style={{ backgroundColor: colors.border }}>
                            <Slider.Range className="absolute rounded-full h-full h-full"
                                style={{ backgroundColor: colors.primaryDark }} />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer"
                            style={{ backgroundColor: colors.primary }} />
                    </Slider.Root>
                    {/* 3CD6D6 */}
                    <LockOutlinedIcon fontSize='small' />

                </div>
            </div>
        </div>
    )
}

export default Gripper
