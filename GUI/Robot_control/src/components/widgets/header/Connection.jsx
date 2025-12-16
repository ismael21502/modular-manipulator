import React, { useEffect, useState } from 'react'
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { useWebSocket } from "../../../context/WebSocketContext.jsx"
import ActiviyIndicator from '../../ui/indicators/LoadingIndicator.jsx';

function Connection() {
    const { colors, mode } = useTheme()
    const { isConnected, isConnecting, initializeWebSocket, disconnect, port, setPort, IP, setIP } = useWebSocket()
    const onIPChange = (newIP) => {
        setIP(newIP)
    }
    const onPortChange = (newPort) => {
        setPort(newPort)
    }
    return (
        <div className='flex flex-row items-center rounded-md border-1 py-2 px-5 gap-5 text-sm'
            style={{ borderColor: colors.border, color: colors.text.primary }}>
            <p>CONEXIÓN</p>
            <div className='flex flex-row justify-end items-center'>
                <input type="text" className='w-30 px-2 text-end' placeholder='IP' value={IP} onChange={(e) => { onIPChange(e.target.value) }} />
                <p>:</p>
                <input type="text" className='w-20 px-2' placeholder='PORT' value={port} onChange={(e) => { onPortChange(e.target.value) }} />
            </div>
            <div className='h-5 w-[1px] bg-gray-400'>
            </div>
            <button onClick={() => {
                isConnected
                    ? disconnect()
                    : initializeWebSocket()
            }}>
                <div className="button flex rounded-md px-2 py-1 items-center gap-1 cursor-pointer text-white"
                    style={isConnected ? { backgroundColor: colors.danger } :  { backgroundColor: mode === "light" ? "#1e293b" : "#2b384e" }}>
                    {isConnected
                        ? <LinkOffIcon />
                        : isConnecting
                            ? <ActiviyIndicator color={"white"} /> 
                            : <LinkIcon />}
                    <p>{isConnected ? "Desconectar" : isConnecting ? "Conectando..." : "Conectar"}</p>
                </div>
            </button>
            {/* <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}>

            </div> */}
        </div>
    )
}

export default Connection