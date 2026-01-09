import CustomScroll from '../../ui/scrolls/CustomScroll'
import { useTheme } from '../../../context/ThemeContext'
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

function ConfigurationModal({ onClose = () => { } }) {
    const { colors } = useTheme()
    const [activeColor, setActiveColor] = useState("purple")
    return (
        <div className='fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000'
        >
            <div className="relative flex flex-col w-[80%] h-[90%] rounded-xl border"
                style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }}>
                <div className="flex flex-row w-full justify-between p-5 text-2xl border-b"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-row gap-3 items-center font-bold">
                        <TuneIcon fontSize='large' style={{ color: colors.primary }} />
                        <p>Configuración</p>
                    </div>
                    <CloseIcon fontSize='large' onClick={onClose} className={`button hover:text-[${colors.danger}]`} />
                </div>
                <CustomScroll className="p-5" scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
                    <div className='flex flex-col w-full py-3'>
                        <h1 style={{ color: colors.text.title }} className='font-bold'>APARIENCIA</h1>
                        <div className="w-full h-[2px] my-3"
                            style={{ backgroundColor: colors.border }}></div>
                        <div className="flex flex-row justify-between py-2">
                            <p>Modo oscuro</p>
                            <div className="w-4 h-4 bg-red-600"></div>
                        </div>
                        <div>
                            <h2>Color principal</h2>
                            <div className="flex items-center gap-4 p-2">
                                <span className={`rounded-full w-8 h-8 cursor-pointer transition-all duration-50 ease-out hover:scale-[1.03] hover:outline-2 hover:outline-offset-2 ${activeColor === "purple" ? "outline-2 outline-offset-2" : ''}`}
                                    style={{ backgroundColor: "#6d40d8", outlineColor: "#6d40d8" }}
                                    onClick={() => setActiveColor("purple")} />
                                <span className={`rounded-full w-8 h-8 cursor-pointer transition-all duration-50 ease-out hover:scale-[1.03] hover:outline-2 hover:outline-offset-2 ${activeColor === "blue" ? "outline-2 outline-offset-2" : ''}`}
                                    style={{ backgroundColor: "#4070d8", outlineColor: "#4070d8" }}
                                    onClick={() => setActiveColor("blue")} />
                                <span className={`rounded-full w-8 h-8 cursor-pointer transition-all duration-50 ease-out hover:scale-[1.03] hover:outline-2 hover:outline-offset-2 ${activeColor === "red" ? "outline-2 outline-offset-2" : ''}`}
                                    style={{ backgroundColor: "#df3636", outlineColor: "#df3636" }}
                                    onClick={() => setActiveColor("red")} />
                            </div>
                        </div>
                    </div>

                </CustomScroll>
                <div className="flex flex-row p-5 border-t justify-end"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-row gap-3 w-[40%] ">
                        <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1 opacity-90 hover:opacity-100'
                            style={{ borderColor: colors.border, backgroundColor: colors.border, color: colors.text.title }}
                            onClick={() => { }}>
                            <p>Cancelar</p>
                        </button>
                        <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1 text-white font-bold opacity-90 hover:opacity-100'
                            style={{ borderColor: colors.primaryDark, backgroundColor: colors.primaryDark }}
                            onClick={() => { }}>
                            <p>Guardar cambios</p>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ConfigurationModal