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

      <div className='flex flex-row gap-4 items-center'>
        {/* <div className="flex flex-row rounded-md border-1 px-2 py-1 items-center gap-2"
        style={{color: colors.text.title, borderColor: colors.border, backgroundColor: `${colors.border}5E`}}>
          <div className="rounded-full w-3 h-3 animate-pulse-rec"
            style={{ backgroundColor: true? colors.success :colors.dangerDark }}/>
          <p>En espera</p>
        </div>
        <button className='cursor-pointer'
        // Stop function
        onClick={()=>{}}> 
          <div className="button flex flex-row gap-2 rounded-md border-1 py-1 px-2"
            style={{ borderColor: colors.dangerDark, color: colors.dangerDark, backgroundColor: `${colors.dangerDark}0F` }}>
            <BlockIcon style={{ color: colors.dangerDark }} />
            <p>Detener</p>
          </div>
        </button> */}
        <Connection />
        {mode === "light"
          ? <button className='cursor-pointer' style={{ color: colors.text.primary }} onClick={() => { setMode("dark") }}>
            <DarkModeRoundedIcon fontSize='large' />
          </button>
          : <button className='cursor-pointer' style={{ color: colors.text.primary }} onClick={() => { setMode("light") }}>
            <LightModeRoundedIcon fontSize='large' />
          </button>}
        <button className='cursor-pointer' style={{ color: colors.text.primary }}>
          <SettingsIcon fontSize='large' />
        </button>
      </div>
    </div>
  )
}

export default Header