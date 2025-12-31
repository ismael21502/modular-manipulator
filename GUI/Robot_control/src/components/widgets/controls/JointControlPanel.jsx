import React, { useEffect, useRef, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useTheme } from "../../../context/ThemeContext";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { useRobotState } from "../../../context/RobotState";
import validateNumber from "../../../utils/validate";
import { debounce, join } from "lodash";
import { useWebSocket } from "../../../context/WebSocketContext";
import ReplayIcon from '@mui/icons-material/Replay';

function ManualControl({ }) {
  const { colors } = useTheme()
  // const { joints, setJoints } = useRobotState()
  const { throttledSend } = useWebSocket()
  const state = useRobotState()

  const jointConfig = state.robotConfig.joints
  const endEffectorsConfig = state.robotConfig.end_effectors

  const joints = state.robotState.joints
  const setJoint = state.robotApi.setJoint
  const gotoPos = state.startPosition

  const [tempValues, setTempValues] = useState(jointConfig.map(joint => {
    return joint.default
  }))

  useEffect(() => {
    setTempValues(joints)
  }, [joints])

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
  }

  const setVal = (i, val) => {
    setJoint(i, val)
    const newJoints = [...joints]
    newJoints[i] = val
    throttledSend("articular_move", newJoints)
  }

  const commitVal = (i, val, min, max) => {
    const valid = validateNumber(val, min, max)
    if (valid === undefined) return
    setVal(i, valid)
  }

  const handleGotoZero = () => {
    throttledSend.cancel()
    gotoPos(jointConfig.map(joint => joint.default), endEffectorsConfig.map(effector => effector.default), 200)
  }
  return (
    <div className='flex flex-col flex-1 py-2'
      style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
      <div className="flex flex-row justify-between w-full py-2 px-5 font-bold items-center">
        <div className="flex flex-row gap-2 items-center">
          <AccessibilityNewIcon />
          <p>CONTROL ARTICULAR</p>
        </div>
        <button className="flex flex-row text-xs items-center gap-1 hover:border-b-[1px] cursor-pointer"
          style={{ borderColor: colors.primary, color: colors.primary }}
          onClick={
            handleGotoZero
          }>
          <ReplayIcon fontSize="smaller" />
          <p>Default</p>
        </button>
      </div>

      <div className="flex flex-col py-2 px-5 w-full justify-between gap-6">
        {jointConfig.map((joint, i) => (
          <div key={joint.id} className="flex flex-col items-center gap-2">
            <div className="flex flex-row w-full justify-between">
              <h3 className="text-sm text-center">{joint.label}</h3>
              <div className="flex items-start">
                <input
                  type="text"
                  className="text-sm mb-3 w-[2.5rem] text-end mr-1 outline-none"
                  value={tempValues[i] ?? ""}
                  onChange={(e) => handleChangeInput(i, e.target.value, joint.min, joint.max)}
                  onBlur={(e) => {
                    if (e.target.value === "-") {
                      commitVal(i, joint.default, joint.min, joint.max)
                    } else {
                      commitVal(i, e.target.value, joint.min, joint.max)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitVal(i, e.target.value !== '-' ? e.target.value : joint.default, joint.min, joint.max)
                      // e.target.blur()
                    }
                  }}
                />

                <span>{joint.unit === "deg" ? "°" : joint.unit}</span>
              </div>
            </div>
            <Slider.Root
              className="relative flex items-center justify-center select-none touch-none h-1 w-full"
              min={joint.min}
              max={joint.max}
              step={1}
              onValueChange={(val) => handleChangeSlider(i, val)}
              value={[tempValues[i] === '-' ? joint.default : tempValues[i]]}
            >
              <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                style={{ backgroundColor: colors.border }}>
                <Slider.Range className={`absolute rounded-full h-full h-full ${tempValues[i] === joints[i] ? '' : 'opacity-0'}`}
                  style={{ backgroundColor: colors.primary }} />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 rounded-full outline-none hover:cursor-pointer"
                style={{
                  backgroundColor: colors.primary,
                  outline: tempValues[i] === joints[i] ? 'none' : `2px dashed ${colors.primary}`,
                  outlineOffset: tempValues[i] === joints[i] ? 0 : 2,
                }} />
            </Slider.Root>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManualControl;
