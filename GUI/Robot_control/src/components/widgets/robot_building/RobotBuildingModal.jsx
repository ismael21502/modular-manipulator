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
                id: generateId(),
                type: null,     // e.g. 'revolute', 'prismatic', etc.
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
                    j.id === jointId ? { ...j, ...payload } : j
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

    const [wizardState, dispatch] = useReducer(wizardReducer, initialState)

    const buildSteps = [
        {
            id: "base", title: "Base", hint: "Tipo de base",
            content: {
                label: "Selecciona el tipo de base",
                options: [
                    { label: "Base estándar", img: "vite.svg", value: { type: "fixed" } },
                    { label: "Base móvil V1", img: "vite.svg", value: { type: "mobile_v1" } },
                    { label: "Base móvil V2", img: "vite.svg", value: { type: "mobile_v2" } },
                ]
            }
        },
        {
            id: "joints", title: "Articulaciones", hint: "Grados de libertad",
            content: {
                label: "Configuración de las articulaciones",
                // Estas opciones se usarán para elegir tipo de joint al editar una joint
                options: [
                    { label: "Revolute", img: "vite.svg", value: { type: "revolute" } },
                    { label: "Prismatic", img: "vite.svg", value: { type: "prismatic" } },
                    { label: "Spherical", img: "vite.svg", value: { type: "spherical" } }
                ],
                linkOptions: [
                    { label: "Straight 10mm", img: "vite.svg", value: { type: "straight10mm" } },
                    { label: "Straight 20mm", img: "vite.svg", value: { type: "straight20mm" } },
                    { label: "Straight 40mm", img: "vite.svg", value: { type: "straight40mm" } },
                ]
            }
        },
        {
            id: "tool", title: "Herramienta", hint: "Efector final",
            content: {
                label: "Selecciona la herramienta",
                options: [
                    { label: "Gripper MG90s", img: "vite.svg", value: { type: "gripper_mg90s" } },
                ]
            }
        },
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
                                dispatch({ type: "ADD_JOINT" });
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
                                    key={joint.id}
                                    className={`flex justify-between p-3 rounded-lg cursor-pointer border hover:ring-2 ring-[var(--primary)] ${selectedJointId === joint.id ? "ring-2" : ""}`}
                                    onClick={() => setSelectedJointId(joint.id)}
                                    style={{ borderColor: colors.border, backgroundColor: selectedJointId === joint.id ? `${colors.primary}1A` : "transparent" }}
                                >
                                    <div>
                                        <div className="font-semibold">Joint {idx + 1}</div>
                                        <div className="text-xs opacity-90 font-bold"
                                            style={{ color: colors.text.secondary }}>{joint.type || joint.link
                                                ? [joint.type, joint.link].filter(Boolean).join(" - ")
                                                : "Sin tipo"}</div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="text-sm opacity-80 hover:opacity-100 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch({ type: "REMOVE_JOINT", jointId: joint.id });
                                                if (selectedJointId === joint.id) setSelectedJointId(null);
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
                            joint={wizardState.joints.find(j => j.id === selectedJointId)}
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
                        j.type &&
                        j.link &&
                        Object.keys(j.link).length > 0
                    )
                );

            default:
                return true;
        }
    }
      
    const handleNextStep = () => {
        // buildSteps[currentStep]
        console.log("Así va el wizard: ", wizardState[buildSteps[currentStep].id])
        // if (isEmpty(wizardState[buildSteps[currentStep].id])) console.log("NO HAY NADA")
        if (currentStep >= buildSteps.length - 1) {
            console.log("Construir robotConfig.json", wizardState);
            return;
        }
        setCompletedSteps(prev => [
            ...prev,
            buildSteps[currentStep].id
        ]);
        setCurrentStep(currentStep + 1)
    }
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
                    </div>
                    <div className="flex-1 h-80 w-full p-6">
                        <div className="flex flex-col h-full w-full rounded-md justify-center p-4 gap-4 border"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <h2 className="text-xl font-bold text-center"
                                style={{ color: colors.text.title }}>Vista previa</h2>
                            <div className="rounded-lg overflow-hidden border aspect-square"
                                style={{ borderColor: colors.border }}>
                                {/* <Scene /> */}
                            </div>
                        </div>
                    </div>
                    <button className="flex flex-row gap-2 p-6 cursor-pointer opacity-80 hover:opacity-100"
                        onClick={onClose}>
                        <ArrowBackIcon />
                        Regresar
                    </button>
                </div>

                <div className="flex flex-2 flex-col">
                    <div className="flex flex-1 min-h-0">
                        {/* Si el paso actual es 'joints' renderizamos panel especial */}
                        {currentStepObj.id === "joints" ? (
                            <JointsPanel step={currentStepObj} />
                        ) : (
                            <Select title={currentStepObj.content.label}>
                                <div className="w-full grid grid-cols-3 gap-4">
                                    {currentStepObj.content.options.map((option, index) => (
                                        <BuildCard
                                            key={index}
                                            label={option.label}
                                            imgSrc={option.img}
                                            onClick={() => handleSelectOptionForStep(option)}
                                            isActive={wizardState[currentStepObj.id]?.label === option.label}
                                        />
                                    ))}
                                </div>
                            </Select>
                        )}
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
