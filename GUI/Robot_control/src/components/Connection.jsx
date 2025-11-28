import React, { useState } from 'react'
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTheme } from '../context/ThemeContext';

function Connection() {
    const { colors } = useTheme()
    const [isConnected, setIsConnected] = useState(false)
    return (
        <div className='flex flex-row items-center rounded-md border-1 py-2 px-5 gap-5 text-sm'
        style={{borderColor: colors.border, color: colors.text.primary}}>
            <p>CONEXIÓN</p>
            <input type="text" className='w-30 px-2' defaultValue={"192.168.1.100"} placeholder='IP' />
            <p>:</p>
            <input type="text" className='w-20 px-2' defaultValue={"5173"} placeholder='PORT' />
            <div className='h-5 w-[1px] bg-gray-400'>
            </div>
            <button>
                <div className="flex rounded-md px-2 py-1 items-center gap-3 cursor-pointer bg-blue-800 text-white">
                    {isConnected
                        ? <LinkOffIcon />
                        : <LinkIcon />}
                    <p>{isConnected ? "Desconectar" : "Conectar"}</p>
                </div>
            </button>
            <div className='w-3 h-3 rounded-full bg-green-500'>

            </div>
        </div>
    )
}

export default Connection