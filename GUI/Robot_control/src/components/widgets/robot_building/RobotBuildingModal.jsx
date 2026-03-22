import Modal from "../modals/Modal";
import { useTheme } from "../../../context/themes/ThemeContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildStep from "./BuildStep";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useEffect, useReducer, useState } from "react";
import SolidButton from "../../ui/buttons/SolidButton.jsx";
import { useWebSocket } from "../../../context/WebSocketContext.jsx";
import SelectPanel from "./SelectPanel.jsx";
import FinalConfigurationPanel from "./FinalConfigurationPanel.jsx";
import JointsPanel from "./JointsPanel.jsx";
//[ ] Cambiar joints[i].id por joints[i].joint

/* --------------------------
   1) Estado inicial y reducer
   -------------------------- */
const initialState = {
    name: "",
    base: {},
    joints: [],
    tool: {},
    //[ ] Debería mandar la estructura cartesian desde el backend? 
    cartesian: [
        {
            id: "x",
            label: "Eje X (Lateral)",
            min: -100,
            max: 100,
            default: 0,
        },
        {
            id: "y",
            label: "Eje Y (Profundidad)",
            min: -100,
            max: 100,
            default: 0,
        },
        {
            id: "z",
            label: "Eje Z (Vertical)",
            min: -100,
            max: 100,
            default: 0,
        },
        {
            id: "roll",
            label: "Roll",
            min: -180,
            max: 180,
            default: 0,
        },
        {
            id: "pitch",
            label: "Pitch",
            min: -180,
            max: 180,
            default: 0,
        },
        {
            id: "yaw",
            label: "Yaw",
            min: -180,
            max: 180,
            default: 0,
        }
    ]
};

function generateId() {
    // fallback simple para id único si crypto.randomUUID no existe
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function wizardReducer(state, action) {
    switch (action.type) {
        case "SET_STEP_VALUE": {
            const { stepId, value } = action;
            return {
                ...state,
                [stepId]: value
            }
        }

        case "ADD_JOINT": {
            const newJoint = {
                tempId: generateId(),
                id: null,
                link: null,       // datos del link
                limits: {
                    min: -90,
                    max: 90,
                    default: 0
                }
            }
            return {
                ...state,
                joints: [...state.joints, newJoint]
            }
        }

        case "UPDATE_JOINT": {
            const { jointId, payload } = action
            return {
                ...state,
                joints: state.joints.map(j =>
                    j.tempId === jointId ? { ...j, ...payload } : j
                )
            }
        }

        case "REMOVE_JOINT": {
            const { jointId } = action
            return {
                ...state,
                joints: state.joints.filter(j => j.id !== jointId)
            }
        }

        case "UPDATE_NAME": {
            const { newName } = action
            return {
                ...state,
                name: newName
            }
        }

        case "UPDATE_CARTESIAN": {
            const { axisId, payload } = action
            return {
                ...state,
                cartesian: state.cartesian.map(cart => 
                    cart.id === axisId ? {...cart, ...payload} : cart
                )
            }
        }

        default:
            return state
    }
}

/* --------------------------
   2) Componente principal
   -------------------------- */
function RobotBuildingModal({ onClose }) {
    const { colors, withAlpha } = useTheme()
    const { loadRobotParts, buildRobot } = useWebSocket()
    const [robotCatalog, setRobotCatalog] = useState()
    useEffect(() => {
        const loadData = async () => {
            const data = await loadRobotParts()
            setRobotCatalog(data)
        }
        loadData()
    }, [])
    const [wizardState, dispatch] = useReducer(wizardReducer, initialState)

    const buildSteps = [
        {
            id: "base", title: "Base", hint: "Tipo de base",
            component: SelectPanel,
            content: {
                label: "Selecciona el tipo de base",
                options: robotCatalog?.bases || []
                // options: [
                //     { label: "Base estándar", img: "vite.svg", value: "ola" },
                //     { label: "Base móvil V1", img: "vite.svg", value: { type: "mobile_v1" } },
                //     { label: "Base móvil V2", img: "vite.svg", value: { type: "mobile_v2" } },
                // ]
            }
        },
        {
            id: "joints", title: "Articulaciones", hint: "Grados de libertad",
            component: JointsPanel,
            content: {
                label: "Configuración de las articulaciones",
                // Estas opciones se usarán para elegir tipo de joint al editar una joint
                options: robotCatalog?.joints || [],
                linkOptions: robotCatalog?.links || []
                // options: [
                //     { label: "Revolute", img: "vite.svg", value: { type: "revolute" } },
                //     { label: "Prismatic", img: "vite.svg", value: { type: "prismatic" } },
                //     { label: "Spherical", img: "vite.svg", value: { type: "spherical" } }
                // ],
                // linkOptions: [
                //     { label: "Straight 10mm", img: "vite.svg", value: { type: "straight10mm" } },
                //     { label: "Straight 20mm", img: "vite.svg", value: { type: "straight20mm" } },
                //     { label: "Straight 40mm", img: "vite.svg", value: { type: "straight40mm" } },
                // ]
            }
        },
        {
            id: "tool", title: "Herramienta", hint: "Efector final",
            component: SelectPanel,
            content: {
                label: "Selecciona la herramienta",
                options: robotCatalog?.tools || []
                // options: [
                //     { label: "Gripper MG90s", img: "vite.svg", value: { type: "gripper_mg90s" } },
                // ]
            }
        },
        {
            id: "final", title: "Configuración final", hint: "Espacio de trabajo",
            component: FinalConfigurationPanel,
            content: {
                title: "Configuración final",
                subtitle: "Define el espacio de trabajo y el nombre del robot",
                options: [{ label: "Gripper MG90s", img: "vite.svg", value: { type: "gripper_mg90s" } },]
            }
        }
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    // Para editar una joint seleccionada
    const [selectedJointId, setSelectedJointId] = useState(null);

    useEffect(() => {
        console.log("Wizard: ", wizardState);
    }, [wizardState]);

    /* --------------------------
       Helper: obtener step actual
       -------------------------- */
    const currentStepObj = buildSteps[currentStep];

    /* --------------------------
       Handler cuando seleccionas una opción en los pasos simples
       (base / tool / etc.)
       -------------------------- */
    function handleSelectOptionForStep(option) {
        const stepId = currentStepObj.id;
        dispatch({ type: "SET_STEP_VALUE", stepId, value: option });
    }

    /* --------------------------
       Render principal
       -------------------------- */

    function isStepComplete(stepId, wizardState) { //[ ] Mejorar esta función para validar cada paso. Tal vez pueda crear una función diferente para cada paso y guardarla en los buildSteps
        const value = wizardState[stepId];
        switch (stepId) {
            case "base":
            case "tool":
                return value && Object.keys(value).length > 0;

            case "joints":
                return (
                    value.length > 0 &&
                    value.every(j =>
                        j.id &&
                        j.link //&&
                        // Object.keys(j.link).length > 0
                    )
                )
            case "final":

            default:
                return true;
        }
    }

    const handleNextStep = async () => {
        // buildSteps[currentStep]
        // console.log("Así va el wizard: ", wizardState[buildSteps[currentStep].id])
        // if (isEmpty(wizardState[buildSteps[currentStep].id])) console.log("NO HAY NADA")
        if (currentStep >= buildSteps.length - 1) {
            console.log("Construir robotConfig.json", wizardState)
            await buildRobot(wizardState)
            onClose() //[ ] Esperar confirmación
            return
        }
        setCompletedSteps(prev => [
            ...prev,
            buildSteps[currentStep].id
        ]);
        setCurrentStep(currentStep + 1)
    }

    const handleBuildRobot = () => { //[ ] Esto es un onconfirm
        console.log("OLA")
    }

    return (
        <Modal>
            <div className="flex flex-row h-full w-full"
                style={{ backgroundColor: colors.background, color: colors.text.primary }}>
                <div className="flex flex-1 flex-col border-r"
                    style={{ borderColor: colors.border }}>
                    <div className="flex flex-1 flex-col p-6 gap-6"
                    >
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
                    </div>
                    <div className="flex flex-1 h-80 w-full p-6">
                        <div className="flex flex-col h-full w-full rounded-md justify-center p-4 gap-4 border"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <h2 className="text-xl font-bold text-center"
                                style={{ color: colors.text.title }}>Vista previa</h2>
                            <div className="flex flex-1 overflow-hidden justify-center">
                                {/* <div className="flex h-full aspect-square bg-red-600 border rounded-lg" style={{ borderColor: colors.border }}>
                                    <Scene cameraPos={[0, 0.2, 0.7]} gizmoSize={0.8} useControlsLegend={false} />
                                </div> */}
                            </div>
                        </div>
                    </div>

                    <button className="flex h-10 items-center flex-row gap-2 p-6 cursor-pointer opacity-80 hover:opacity-100"
                        onClick={onClose}>
                        <ArrowBackIcon />
                        Regresar
                    </button>
                </div>

                <div className="flex flex-3 flex-col">
                    <div className="flex flex-1 min-h-0">
                        {/* Si el paso actual es 'joints' renderizamos panel especial */}
                        {/* <currentStepObj.component/> */}
                        <currentStepObj.component
                            step={currentStepObj}
                            wizardState={wizardState}
                            onSelectOption={handleSelectOptionForStep}
                            dispatch={dispatch}
                            selectedJointId={selectedJointId}
                            setSelectedJointId={setSelectedJointId}
                        />
                        {/* {currentStepObj.id === "joints" ? (
                            <currentStepObj.component step={currentStepObj} />
                            // <JointsPanel step={currentStepObj} />
                        ) : (
                            <Select title={currentStepObj.content.label}>
                                <div className="w-full grid grid-cols-3 gap-4">
                                    {currentStepObj.content.options.map((option, index) => (
                                        <BuildCard
                                            key={index}
                                            label={option.label}
                                            imgSrc={option.img}
                                            onClick={() => handleSelectOptionForStep(option.id)}
                                            isActive={wizardState[currentStepObj.id] === option.id}
                                        />
                                    ))}
                                </div>
                            </Select>
                        )} */}
                    </div>

                    <div className="flex flex-0.1 border-t p-6 flex-row justify-end gap-6 text-xl"
                        style={{ borderColor: colors.border }}>
                        {currentStep !== 0 && <button className="cursor-pointer py-2 px-4 opacity-90 hover:opacity-100"
                            onClick={() => {
                                if (currentStep === 0) return;
                                setCompletedSteps(prev => prev.slice(0, currentStep - 1));
                                setCurrentStep(currentStep - 1);
                            }}>
                            Atrás
                        </button>}
                        <div className="flex">
                            <SolidButton
                                color={"white"}
                                bgColor={colors.primaryDark}
                                borderColor={colors.primaryDark}
                                text={currentStep === buildSteps.length - 1 ? "Finalizar" : "Siguiente"}
                                onClick={handleNextStep}
                                className={"px-8"}
                                disabled={!isStepComplete(buildSteps[currentStep].id, wizardState)}
                            />
                        </div>
                        {/* <button className="primaryButton py-2 px-4 rounded-md"
                            onClick={() => {
                                if (currentStep >= buildSteps.length - 1) {
                                    console.log("Construir robotConfig.json", wizardState);
                                    return;
                                }
                                setCompletedSteps(prev => [
                                    ...prev,
                                    buildSteps[currentStep].id
                                ]);
                                setCurrentStep(currentStep + 1)
                            }}>
                            {currentStep === buildSteps.length - 1 ? "Finalizar" : "Siguiente"}
                        </button> */}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default RobotBuildingModal
