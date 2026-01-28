import React, { useEffect } from 'react'
import { useTheme } from '../../../context/themes/ThemeContext'
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
function PopUp({ type = "info", title, message, onConfirm, onCancel }) {
    const { colors } = useTheme()
    useEffect(()=>{
        console.log("Isopen")
    },[])
    // if (isOpen != true) return null
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000'>
            <div className='w-[350px] rounded-lg p-4 flex flex-col gap-3'
                style={{
                    color: colors.text.primary,
                    backgroundColor: colors.background,
                    border: '1px solid',
                    borderColor: colors.border
                }}>
                {/* <div className='flex gap-2 text-2xl justify-center'>
                    <p>{title}</p>
                </div> */}
                <div className="flex mx-auto rounded-full p-2 items-center justify-center"
                    style={{ backgroundColor: type === 'danger' ? colors.dangerDark : colors.success, color: "#FFF"}}>
                    {type === 'danger' ? <WarningIcon fontSize='large' /> : <InfoIcon fontSize='large'/>}
                </div>
                <h1 className='text-2xl text-center font-bold'
                style={{color: colors.text.secondary}}>{title}</h1>
                <div className='flex flex-col justify-between h-full'>
                    <p className='text-lg text-center'>{message}</p>
                    <div className="flex justify-between text-lg mt-5">
                        <button className='button flex py-1 px-4 gap-2 items-center rounded-md opacity-60 hover:opacity-100'
                        style={{ backgroundColor: colors.border, color: colors.text.title}}
                            onClick={onCancel}>
                            Cancelar
                        </button>
                        <button className='button flex py-1 px-4 gap-2 items-center rounded-md text-white'
                        style={{ backgroundColor: colors.dangerDark}}
                            onClick={onConfirm}>
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopUp
