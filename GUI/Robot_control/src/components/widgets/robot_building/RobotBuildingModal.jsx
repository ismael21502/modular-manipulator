import Modal from "../modals/Modal"
import { useTheme } from "../../../context/ThemeContext"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildStep from "./BuildStep";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Select from "./Select";
import BuildCard from "./BuildCard.jsx"
import { useEffect, useState } from "react";

function RobotBuildingModal({ onClose }) {
    const { colors } = useTheme()

    const [wizardState, setWizardState] = useState(
        {
            robotName: "",
            base: {},
            joints: [],
            end_effector: {}
        }
    )
    const buildSteps = [
        {
            id: "base", title: "Base", hint: "Tipo de base",
            content: {
                label: "Selecciona el tipo de base",
                options: [
                    { label: "Base estándar", img: "vite.svg", isActive: true },
                    { label: "Base móvil V1", img: "vite.svg", isActive: false },
                    { label: "Base móvil V2", img: "vite.svg", isActive: false },
                ]
            }
        },
        {
            id: "joints", title: "Articulaciones", hint: "Grados de libertad",
            content: {
                label: "Configuración de las articulaciones",
                options: [
                    { label: "Articulación tipo Y", img: "vite.svg", isActive: true },
                ]
            }
        },
        {
            id: "tool", title: "Herramienta", hint: "Efector final",
            content: {
                label: "Selecciona la herramienta",
                options: [
                    { label: "Gripper MG90s", img: "vite.svg", isActive: true },]
            }
        },
    ]

    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    useEffect(() => {
        console.log("Current: ", currentStep)
        console.log("BuildSteps: ", buildSteps[0])
    }, [])
    return (
        <Modal>
            <div className="flex flex-row h-full w-full"
                style={{ backgroundColor: colors.background, color: colors.text.primary }}>
                <div className="flex flex-1 flex-col border-r"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-1 flex-col p-6 gap-6"
                        style={{ backgroundColor: colors.backgroundSubtle }}>
                        <div className="flex font-bold text-2xl items-center gap-2"
                            style={{ color: colors.text.title }}>
                            <SmartToyIcon fontSize="large" style={{ color: colors.primary }} />
                            Configuración del robot
                        </div>
                        {buildSteps.map((step, index) => (
                            <BuildStep
                                key={index}
                                title={step.title}
                                hint={step.hint}
                                number={index + 1}
                                isActive={index === currentStep}
                                complete={completedSteps.includes(step.id)} />
                        ))}
                        {/* active={currentStep === step.id}
                        complete={completedSteps.includes(step.id)} */}
                    </div>
                    <button className="flex flex-row gap-2 p-6 cursor-pointer opacity-80 hover:opacity-100"
                        onClick={onClose}>
                        <ArrowBackIcon />
                        Regresar
                    </button>
                </div>
                <div className="flex flex-2 flex-col">
                    <div>
                        {/* Escena 3D */}
                    </div>
                    <div className="flex flex-1">

                        <Select title={buildSteps[currentStep].content.label}>
                            <div className="w-full grid grid-cols-3 gap-4">
                                {buildSteps[currentStep].content.options.map((option, index) => (
                                    <BuildCard
                                        key={index}
                                        label={option.label}
                                        imgSrc={option.img}
                                        onClick={() => { }}
                                        isActive={false} />
                                ))}
                            </div>
                        </Select>
                    </div>
                    <div className="flex border-t p-6 flex-row justify-end gap-6 text-xl"
                        style={{ borderColor: colors.border }}>
                        {currentStep !== 0 && <button className="cursor-pointer py-2 px-4 opacity-80 hover:opacity-100"
                            onClick={() => {
                                if (currentStep === 0) return
                                setCompletedSteps(
                                    prev => prev.slice(0, currentStep - 1)
                                )
                                setCurrentStep(currentStep - 1)

                            }}>
                            Atrás
                        </button>}
                        <button className="primaryButton py-2 px-4 rounded-md"
                            onClick={() => {
                                console.log("Current: ", currentStep)
                                if (currentStep >= buildSteps.length - 1) {
                                    console.log("Construir robotConfig.json")
                                    return
                                }
                                setCompletedSteps(prev => [
                                    ...prev,
                                    buildSteps[currentStep].id
                                ])
                                setCurrentStep(currentStep + 1)
                            }}>
                            {currentStep === buildSteps.length - 1 ? "Finalizar" : "Siguiente"}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default RobotBuildingModal