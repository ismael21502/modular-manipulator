import React from 'react'
import Connection from './Connection'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useTheme } from '../../../context/ThemeContext';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'; 
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'; 
import BlockIcon from '@mui/icons-material/Block';
import { color } from '@mui/system';

function Header({ title }) {
  const { colors, mode, setMode } = useTheme()
  return (
    <div className='flex items-center justify-between flex-row w-full p-2 border-b-1'
      style={{ borderColor: colors.border, color: colors.text.primary }}>
      <div className='flex flex-row gap-3 items-center'> {/*Title*/}
        <div className="flex items-center justify-center rounded-md p-2 "
          style={{ backgroundColor: colors.primaryDark }}>
          <PrecisionManufacturingIcon className='text-white' fontSize='large' />
        </div>
        <p className='text-2xl'
          style={mode === "light" ? { color: "#000" } : { color: '#FFF' }}>
          {title}
        </p>
      </div>

      <div className='flex flex-row gap-4 items-center pr-2'>
        <Connection />
        {mode === "light"
          ? <button className='cursor-pointer' style={{ color: colors.text.primary }} onClick={() => { setMode("dark") }}>
            <DarkModeRoundedIcon fontSize='medium' className='opacity-80 hover:scale-120 hover:opacity-100' />
          </button>
          : <button className='cursor-pointer' style={{ color: colors.text.primary }} onClick={() => { setMode("light") }}>
            <LightModeRoundedIcon fontSize='medium' className='opacity-80 hover:scale-120 hover:opacity-100' />
          </button>}
        <button className='cursor-pointer' style={{ color: colors.text.primary }}>
          <SettingsIcon fontSize='medium' className='opacity-80 hover:scale-120 hover:opacity-100' />
        </button>
      </div>
    </div>
  )
}

export default Header