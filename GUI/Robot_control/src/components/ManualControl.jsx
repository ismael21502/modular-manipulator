import React, { useEffect, useRef, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useTheme } from "../context/ThemeContext";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ReplayIcon from '@mui/icons-material/Replay';
import { useRobotState } from "../context/RobotState";
function ManualControl({ }) {
  const { colors } = useTheme()
  const { joints, jointConfig, setJoints } = useRobotState()

  const handleChangeJoint = (i, val) => {    
    setJoints(prev =>
      {const newJoints = [...prev]
      newJoints[i] = val[0]
      return newJoints}
    )
  }
  return (
    <div className='flex flex-col flex-1 py-2'
      style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
      <div className="flex flex-row justify-between w-full py-2 px-5 font-bold">
        <div className="flex flex-row gap-2 items-center">
          <AccessibilityNewIcon />
          <p>CONTROL ARTICULAR</p>
        </div>
        <button>
          <div className="flex flex-row gap-2 items-center text-xs cursor-pointer"
            style={{ color: colors.primary }}>
            <ReplayIcon sx={{ fontSize: 14 }} />
            <p>Set zero</p>
          </div>
        </button>
      </div>

      <div className="flex flex-col py-2 px-5 w-full justify-between">
        {jointConfig.map((joint, i) => (
          joint.label === "Gripper" ? null :
            <div key={joint.id} className="flex flex-col items-center">
              <div className="flex flex-row w-full justify-between">
                <h3 className="text-sm text-center">{joint.label}</h3>
                <div className="flex items-start">
                  <input
                    type="text"
                    className="text-sm mb-3 w-[2.5rem] text-end mr-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    value={joints[i]}
                    onChange={(e) => handleChangeJoint(joint, e.target.value)}
                  />

                  <span>°</span>
                </div>
              </div>
              <Slider.Root
                className="relative flex items-center justify-center select-none touch-none h-8 w-full"
                min={joint.min}
                max={joint.max}
                step={1}
                onValueChange={(val) => handleChangeJoint(i, val)}
                value={[joints[i]]}
              >
                <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                  style={{ backgroundColor: colors.border }}>
                  <Slider.Range className="absolute rounded-full h-full h-full"
                    style={{ backgroundColor: colors.primaryDark }} />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer"
                  style={{ backgroundColor: colors.primary }} />
              </Slider.Root>
            </div>
        ))}
        {/* {jointList.map((joint) => (
          <div key={joint} className="flex flex-col items-center">
            <div className="flex flex-row w-full justify-between">
              <h3 className="text-sm text-center">{joint}</h3>
              <div className="flex items-start">
                <input
                  type="text"
                  className="text-sm mb-3 w-[2.5rem] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  value={joints[joint]}
                  onChange={(e) => handleChangeJoint(joint, e.target.value)}
                />
                <span>°</span>
              </div>
            </div>
            <Slider.Root
              className="relative flex items-center justify-center select-none touch-none h-8 w-full"
              min={-135}
              max={135}
              step={1}
              onValueChange={(val) => handleChangeJoint(joint, val)}
              value={[joints[joint]]}
            >
              <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                style={{ backgroundColor: colors.border }}>
                <Slider.Range className="absolute rounded-full h-full h-full"
                  style={{ backgroundColor: colors.primaryDark }} />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer"
                style={{ backgroundColor: colors.primary}} />
            </Slider.Root>


          </div>
        ))} */}
      </div>
    </div>
  );
}

export default ManualControl;
