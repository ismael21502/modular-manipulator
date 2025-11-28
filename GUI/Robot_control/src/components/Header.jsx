import React from 'react'
import Connection from './Connection'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useTheme } from '../context/ThemeContext';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode'; 

function Header({ title }) {
  const { colors, mode, setMode } = useTheme()
  return (
    <div className='flex items-center justify-between flex-row w-full p-2 border-b-1'
    style={{color: colors.border}}>
      <div className='flex flex-row gap-3 items-center'> {/*Title*/}
        <div className="flex items-center justify-center rounded-md p-2 "
          style={{ backgroundColor: colors.base_darker }}>
          <PrecisionManufacturingIcon className='text-white' fontSize='large' />
        </div>
        <p className='text-2xl'
        style={mode === "light" ? {color: "#000"}: {color: '#FFF'}}>
          {title}
        </p>
      </div>

      <div className='flex flex-row gap-4 items-center'>
        <Connection />
        {mode === "light"
          ? <button className='cursor-pointer' style={{color: colors.text.primary}} onClick={()=>{setMode("dark")}}>
            <DarkModeIcon fontSize='large' />
          </button>
          : <button className='cursor-pointer' style={{ color: colors.text.primary }} onClick={() => { setMode("light") }}>
            <LightModeIcon fontSize='large' />
          </button>}
        <button className='cursor-pointer' style={{ color: colors.text.primary }}>
          <SettingsIcon fontSize='large' />
        </button>
      </div>
    </div>
  )
}

export default Header