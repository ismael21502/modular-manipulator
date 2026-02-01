import CustomScroll from '../../ui/scrolls/CustomScroll'
import { useTheme } from '../../../context/themes/ThemeContext'
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import Modal from '../modals/Modal';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RobotBuildingModal from '../robot_building/RobotBuildingModal';
import HollowButton from '../../ui/buttons/HollowButton';
import SolidButton from '../../ui/buttons/SolidButton';

function ConfigurationModal({ onClose = () => { } }) {
    const { colors, mode, setMode, setMainColorName, mainColorName, colorOptions } = useTheme()
    const [prevConfig, setPrevConfig] = useState(mainColorName)
    const [openRobotBuild, setOpenRobotBuild] = useState(false)

    const onCancel = () => {
        console.log("CANCEL")
        setMainColorName(prevConfig)
        onClose()
    }

    const onConfirm = () => {
        onClose()
    }
    return (
        <Modal onClose={() => { }}>
            <div className="relative flex flex-col w-[80%] h-[90%] rounded-xl border"
                style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }}>
                <div className="flex flex-row w-full justify-between p-5 text-2xl border-b"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-row gap-3 items-center font-bold">
                        <TuneIcon fontSize='large' style={{ color: colors.primary }} />
                        <p>Configuración</p>
                    </div>
                    <div className="flex items-center gap-3 text-base">
                        {/* <button className="button flex rounded-md text-base border py-1 px-3 gap-2 items-center"
                            style={{ borderColor: colors.primary, color: colors.primaryDark, backgroundColor: `${colors.primary}1F` }}
                            onClick={() => setOpenRobotBuild(true)}>
                            <SmartToyIcon />
                            Construir un robot
                        </button> */}
                        <HollowButton
                            color={colors.primary}
                            bgColor={colors.primary}
                            borderColor={colors.primary}
                            IconComponent={SmartToyIcon}
                            text="Construir un robot"
                            onClick={() => setOpenRobotBuild(true)}
                        />
                        <CloseIcon fontSize='large' onClick={onCancel} className={`button hover:text-[${colors.danger}]`} />
                    </div>
                </div>
                <CustomScroll className="p-5" scrollbarColor={colors.scrollbar.track} thumbColor={colors.scrollbar.thumb}>
                    <div className='flex flex-col w-full py-3'>
                        <h1 style={{ color: colors.text.title }} className='font-bold'>APARIENCIA</h1>
                        <div className="w-full h-[2px] my-3"
                            style={{ backgroundColor: colors.border }}></div>
                        <div className="flex flex-row justify-between py-2">
                            <p>Modo oscuro</p>
                            <button className={`flex px-1 w-16 h-8 rounded-full items-center cursor-pointer`}
                                style={{ backgroundColor: colors.border }}
                                onClick={() => {
                                    setMode(mode === "dark" ? "light" : "dark")
                                }}
                                aria-label="Toggle theme">
                                <span className={`h-6 w-6 bg-red-600 rounded-full
                                    transition-transform duration-300
                                    ${mode === "dark" ? "translate-x-8" : "translate-x-0"}`}
                                    style={{ backgroundColor: "white" }} />
                            </button>
                        </div>
                        <div>
                            <h2>Color principal</h2>
                            <div className="flex items-center gap-4 p-2">                            
                                {colorOptions.map(option => (
                                    // <h1>option</h1>
                                    <span className={`rounded-full w-8 h-8 cursor-pointer transition-all duration-50 ease-out hover:scale-[1.03] hover:outline-2 hover:outline-offset-2 ${mainColorName === option.name ? "outline-2 outline-offset-2" : ''}`}
                                        style={{ backgroundColor: option.primary, outlineColor: option.primary }}
                                        onClick={() => setMainColorName(option.name)} />
                                ))}

                            </div>
                        </div>
                    </div>

                </CustomScroll>
                <div className="flex flex-row p-5 border-t justify-end"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-row gap-3 w-[40%] ">
                        {/* <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1 opacity-90 hover:opacity-100'
                            style={{ borderColor: colors.border, backgroundColor: colors.border, color: colors.text.title }}
                            onClick={onCancel}>
                            <p>Cancelar</p>
                        </button> */}
                        {/* <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1 text-white font-bold opacity-90 hover:opacity-100'
                            style={{ borderColor: colors.primaryDark, backgroundColor: colors.primaryDark }}
                            onClick={onConfirm}>
                            <p>Guardar cambios</p>
                        </button> */}
                        <SolidButton
                            text="Cancelar"
                            borderColor={colors.border}
                            bgColor={colors.border}
                            color={colors.text.title}
                            onClick={onCancel}
                        />
                        <SolidButton
                            text="Guardar cambios"
                            borderColor={colors.primaryDark}
                            bgColor={colors.primaryDark}
                            color={"white"}
                            onClick={onConfirm}
                        />
                    </div>

                </div>
            </div>
            {openRobotBuild && <RobotBuildingModal onClose={() => setOpenRobotBuild(false)} />}
        </Modal>
    )
}

export default ConfigurationModal