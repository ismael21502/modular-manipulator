import React, { useState } from 'react'
import { useRef, useEffect } from 'react';
import Log from './Log';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';

function Console({ }) {
    const { colors } = useTheme()
    const { logs, setLogs } = useWebSocket()
    const logContainerRef = useRef(null)
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs])
    
    function clearConsole(e) {
        setLogs([])
    }
    return (
        <div className='overflow-hidden flex flex-col flex-1 text-white border-1 border-solid border-[#4A4A4A]'
        style={{backgroundColor: colors.terminal.content}}>
            <div className='flex w-full py-1 px-5 font-bold text-lg justify-between items-center border-b-1 border-[#4A4A4A]'
                style={{ backgroundColor: colors.terminal.head }}>
                <div className='flex flex-row gap-2 items-center'>
                    <TerminalIcon fontSize='medium' />{/*fontSize='small' */}
                    <p>TERMINAL</p>
                </div>

                <button onClick={clearConsole}>
                    <div className='flex flex-row gap-2 cursor-pointer text-gray-400 items-center'>
                        <ClearAllIcon fontSize='small' />
                        <p className='text-sm'>Limpiar consola</p>
                    </div>
                </button>

            </div>
            <div className="flex flex-grow flex-col p-2 px-3 w-full overflow-y-auto">
                    {logs.map((log, index) => {
                        if (log.category != "log") {
                            return
                        }
                        return <Log key={`${log.time}-${index}`} type={log.type} time={log.time} content={log.values} />
                    })}
                {/* <div className="flex gap-3 justify-between">
                    <button className='flex py-2 px-4 gap-2 items-center bg-[#e0006f] rounded-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_10px_#e0006f] text-bold'
                        onClick={clearConsole}>
                        <i className="fa-solid fa-trash"></i>
                        <p>Limpiar consola</p>

                    </button>
                    <button className='flex py-2 px-4 gap-2 items-center bg-[#008787] rounded-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_5px_#00FFFF] text-bold'
                        onClick={handleReconnection}>
                        <i className={`fa-solid fa-refresh ${isReconnecting ? "rotate" : ""}`} ></i>
                        <p>Reconectar</p>
                    </button>
                </div> */}
            </div>

        </div>
    )
}

export default Console
