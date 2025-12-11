import { useRef, useEffect } from 'react';
import Log from './Log';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';
import CustomScroll from './CustomScroll';

function Console({ }) {
    const { colors } = useTheme()
    const { logs, setLogs } = useWebSocket()
    const logContainerRef = useRef(null)
    useEffect(() => {
        if (logContainerRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = logContainerRef.current;

            // Verifica si el usuario está al final del contenedor
            const currentHeight = scrollHeight - scrollTop
            const isAtBottom = (clientHeight -50 >= currentHeight || currentHeight <= clientHeight +50)
            // Desplazar solo si el usuario está al final
            if (isAtBottom) {
                logContainerRef.current.scrollTop = scrollHeight;
            }
        }
    }, [logs])
    
    function clearConsole(e) {
        setLogs([])
    }
    return (
        <div className='flex flex-col flex-1 text-white border-1 border-solid border-[#4A4A4A]' //overflow-hidden
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
            {/* <div className="flex flex-grow flex-col p-2 px-3 w-full overflow-y-auto" ref={logContainerRef}>
                    {logs.map((log, index) => {
                        if (log.category != "log") {
                            return
                        }
                        return <Log key={`${log.time}-${index}`} type={log.type} time={log.time} content={log.values} />
                    })}
            </div> */}
            
            <CustomScroll scrollbarColor={"#ffffff10"} thumbColor={colors.scrollbar.thumb} ref={logContainerRef} >
                <div className="flex flex-col gap-2 p-2" >
                    {logs.map((log, index) => {
                        if (log.category != "log") {
                            return
                        }
                        return <Log key={`${log.time}-${index}`} type={log.type} time={log.time} content={log.values} />
                    })}
                </div>
            </CustomScroll>
        </div>
    )
}

export default Console
