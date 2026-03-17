import Modal from "../modals/Modal";
import { useTheme } from "../../../context/themes/ThemeContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildStep from "./BuildStep";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Select from "./Select";
import BuildCard from "./BuildCard.jsx";
import { useEffect, useReducer, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomScroll from "../../ui/scrolls/CustomScroll.jsx";
import JointEditor from "./JointEditor.jsx";
import Scene from "../3D/Scene.jsx";
import SolidButton from "../../ui/buttons/SolidButton.jsx";
import { useWebSocket } from "../../../context/WebSocketContext.jsx";

//[ ] Cambiar joints[i].id por joints[i].joint

/* --------------------------
   1) Estado inicial y reducer
   -------------------------- */
const initialState = {
    robotName: "",
    base: {},
    joints: [],
    tool: {}
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
            };
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
            };
            return {
                ...state,
                joints: [...state.joints, newJoint]
            };
        }

        case "UPDATE_JOINT": {
            const { jointId, payload } = action;
            return {
                ...state,
                joints: state.joints.map(j =>
                    j.tempId === jointId ? { ...j, ...payload } : j
                )
            };
        }

        case "REMOVE_JOINT": {
            const { jointId } = action;
            return {
                ...state,
                joints: state.joints.filter(j => j.id !== jointId)
            };
        }

        default:
            return state;
    }
}

/* --------------------------
   2) Componente principal
   -------------------------- */
function RobotBuildingModal({ onClose }) {
    const { colors } = useTheme()
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

    function SelectPanel({ step }) {
        return (
            <Select title={step.content.label}>
                <div className="w-full grid grid-cols-3 gap-4">
                    {step.content.options.map((option, index) => (
                        <BuildCard
                            key={index}
                            label={option.label}
                            imgSrc={option.img}
                            onClick={() => handleSelectOptionForStep(option.id)}
                            isActive={wizardState[step.id] === option.id}
                        />
                    ))}
                </div>
            </Select>
        )
    }

    function FinalConfigurationPanel({ step }) {
        const [tempVal, setTempVal] = useState("")
        return (
            <Select title={step.content.title} subtitle={step.content.subtitle}>
                <div className="flex flex-1 flex-col gap-8 text-xl">
                    <div className="flex flex-col flex-1 gap-3 p-5 border rounded-lg"
                        style={{ borderColor: colors.border, background: colors.backgroundSubtle }}>
                        <h1>Nombre del robot</h1>
                        {/* Crear un componente para este tipo de inputs */}
                        <input type="text" className="border rounded-lg" />
                    </div>
                    <div className="flex flex-col flex-1 p-5 border rounded-lg"
                        style={{ borderColor: colors.border, background: colors.backgroundSubtle }}>
                        <div className="flex flex-1 flex-row justify-between items-center">
                            <div className="flex flex-row gap-3">
                                <p>ICONO</p>
                                <h1>Límites cartesianos</h1>
                            </div>
                            <div className="flex p-1 justify-center items-center border rounded-lg text-sm"
                                style={{ color: colors.accent, borderColor: colors.accent }}>
                                <h1>Zona de seguridad</h1>
                            </div>
                        </div>
                        <div className="flex flex-col py-4 gap-4">
                            <div className="flex flex-row gap-4">
                                <h2>Eje X</h2>
                                <input type="text" className="border rounded-lg" placeholder="mínimo" />
                                <input type="text" className="border rounded-lg" placeholder="máximo" />
                            </div>
                            <div className="flex flex-row gap-4">
                                <h2>Eje Y</h2>
                                <input type="text" className="border rounded-lg" placeholder="mínimo" />
                                <input type="text" className="border rounded-lg" placeholder="máximo" />
                            </div>
                            <div className="flex flex-row gap-4">
                                <h2>Eje Z</h2>
                                <input type="text" className="border rounded-lg" placeholder="mínimo" />
                                <input type="text" className="border rounded-lg" placeholder="máximo" />
                            </div>
                        </div>
                    </div>
                </div>
            </Select>
        )
        // <Select title={step.content.label}>
        //     <div className="hola">AAAA</div>
        //     {/* <div className="w-full grid grid-cols-3 gap-4">
        //         {step.content.options.map((option, index) => (
        //             <BuildCard
        //                 key={index}
        //                 label={option.label}
        //                 imgSrc={option.img}
        //                 onClick={() => handleSelectOptionForStep(option.id)}
        //                 isActive={wizardState[step.id] === option.id}
        //             />
        //         ))}
        //     </div> */}
        // </Select>
    }
    /* --------------------------
       Renderizado del paso 'joints'
       -------------------------- */
    function JointsPanel({ step }) {
        return (
            <div className="w-full h-full flex">
                {/* LEFT: lista de joints + añadir */}
                <div className="flex flex-col h-full w-1/3">
                    <div className="flex items-center justify-between p-4 pb-0 text-2xl">
                        <h3 className="font-bold">Articulaciones</h3>
                        <button
                            className="flex items-center justify-center p-2 opacity-80 hover:opacity-100 cursor-pointer rounded-full"
                            onClick={() => {
                                dispatch({ type: "ADD_JOINT" }); //[ ] Si quiero sacar esto a otro archivo debo cambiar esto por una prop
                                // seleccionar la recién creada (se añade al final)
                                // como dispatch es síncrono en reducer, el state cambiará en el siguiente render
                                // aquí hacemos un pequeño truco: seleccionar tras un timeout 0 para esperar el re-render
                                // setTimeout(() => {
                                //     const last = wizardState.joints[wizardState.joints.length - 1];
                                //     if (last) setSelectedJointId(last.id);
                                // }, 0);
                            }}
                            style={{ backgroundColor: `${colors.primary}1A`, color: colors.primary }}
                        >
                            <AddIcon />
                        </button>
                    </div>

                    <CustomScroll
                        className="p-2 pr-4"
                        scrollbarColor={colors.scrollbar.track}
                        thumbColor={colors.scrollbar.thumb}>
                        <div className="flex flex-1 min-h-0 flex-col p-2 gap-3">
                            {wizardState.joints.length === 0 && (
                                <div className="text-sm opacity-70">No hay articulaciones aún.</div>
                            )}

                            {wizardState.joints.map((joint, idx) => (
                                <div
                                    key={joint.tempId}
                                    className={`flex justify-between gap-2 p-3 rounded-lg cursor-pointer border hover:ring-2 ring-[var(--primary)] ${selectedJointId === joint.tempId ? "ring-2" : ""}`}
                                    onClick={() => setSelectedJointId(joint.tempId)}
                                    style={{ borderColor: colors.border, backgroundColor: selectedJointId === joint.tempId ? `${colors.primary}1A` : "transparent" }}
                                >
                                    <div>
                                        <div className="font-semibold">Joint {idx + 1}</div>
                                        <div className="text-xs opacity-90 font-bold"
                                            style={{ color: colors.text.secondary }}>{joint.id || joint.link //Cambiar por labels en lugar de ids
                                                ? [step.content.options.find(option => option.id === joint.id)?.label, step.content.linkOptions.find(option => option.id === joint.link)?.label].filter(Boolean).join(" - ")
                                                : "Sin tipo"}</div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="text-sm opacity-80 hover:opacity-100 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch({ type: "REMOVE_JOINT", jointId: joint.id });
                                                if (selectedJointId === joint.tempId) setSelectedJointId(null);
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                                            onMouseLeave={(e) => e.currentTarget.style.color = colors.disabled}
                                            style={{ color: colors.disabled }}
                                        >
                                            {/* Eliminar */}
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </CustomScroll>

                </div>

                {/* RIGHT: editor de la joint seleccionada */}
                <div className="w-2/3 border-l" style={{ borderColor: colors.border }}>
                    {selectedJointId ? (
                        <JointEditor
                            joint={wizardState.joints.find(j => j.tempId === selectedJointId)}
                            jointOptions={step.content.options}
                            linkOptions={step.content.linkOptions}
                            onUpdate={(payload) => dispatch({ type: "UPDATE_JOINT", jointId: selectedJointId, payload })}
                        />
                    ) : (
                        <div className="text-sm opacity-70 p-4">Selecciona una articulación para editarla o pulsa "+".</div>
                    )}
                </div>
            </div>
        )
    }


    /* --------------------------
       Render principal
       -------------------------- */

    function isStepComplete(stepId, wizardState) {
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
                );

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
                        <currentStepObj.component step={currentStepObj} />
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
    );
}

export default RobotBuildingModal
