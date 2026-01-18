import Modal from "../modals/Modal";
import { useTheme } from "../../../context/ThemeContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildStep from "./BuildStep";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Select from "./Select";
import BuildCard from "./BuildCard.jsx";
import { useEffect, useReducer, useState } from "react";

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
                link: {},       // datos del link
                limits: {}      // límites
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
    const { colors } = useTheme();

    const [wizardState, dispatch] = useReducer(wizardReducer, initialState);

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
            <div className="w-full flex gap-6">
                {/* LEFT: lista de joints + añadir */}
                <div className="w-1/3 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Articulaciones</h3>
                        <button
                            className="px-2 py-1 rounded bg-gray-100"
                            onClick={() => {
                                dispatch({ type: "ADD_JOINT" });
                                // seleccionar la recién creada (se añade al final)
                                // como dispatch es síncrono en reducer, el state cambiará en el siguiente render
                                // aquí hacemos un pequeño truco: seleccionar tras un timeout 0 para esperar el re-render
                                setTimeout(() => {
                                    const last = wizardState.joints[wizardState.joints.length - 1];
                                    if (last) setSelectedJointId(last.id);
                                }, 0);
                            }}
                        >
                            + Añadir
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {wizardState.joints.length === 0 && (
                            <div className="text-sm opacity-70">No hay articulaciones aún.</div>
                        )}

                        {wizardState.joints.map((joint, idx) => (
                            <div
                                key={joint.id}
                                className={`p-3 rounded cursor-pointer border ${selectedJointId === joint.id ? 'border-primary' : 'border-gray-200'}`}
                                onClick={() => setSelectedJointId(joint.id)}
                            >
                                <div className="font-semibold">Joint {idx + 1}</div>
                                <div className="text-sm opacity-80">{joint.type ?? "Sin tipo"}</div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        className="text-sm underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch({ type: "REMOVE_JOINT", jointId: joint.id });
                                            if (selectedJointId === joint.id) setSelectedJointId(null);
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: editor de la joint seleccionada */}
                <div className="w-2/3 p-4 border-l" style={{ borderColor: colors.border }}>
                    {selectedJointId ? (
                        <JointEditor
                            joint={wizardState.joints.find(j => j.id === selectedJointId)}
                            options={step.content.options}
                            onUpdate={(payload) => dispatch({ type: "UPDATE_JOINT", jointId: selectedJointId, payload })}
                        />
                    ) : (
                        <div className="text-sm opacity-70">Selecciona una articulación para editarla o pulsa "+ Añadir".</div>
                    )}
                </div>
            </div>
        );
    }

    /* --------------------------
       JointEditor subcomponente (simple)
       - Permite seleccionar tipo de joint usando tus BuildCard
       - Muestra inputs simples para link.length y límites como ejemplo
       -------------------------- */
    function JointEditor({ joint, options = [], onUpdate }) {
        if (!joint) return null;

        return (
            <div className="flex flex-col gap-4">
                <h4 className="font-bold">Editar Joint</h4>

                <div>
                    <div className="text-sm mb-2">Tipo de articulación</div>
                    <div className="grid grid-cols-3 gap-4">
                        {options.map((opt, i) => (
                            <BuildCard
                                key={i}
                                label={opt.label}
                                imgSrc={opt.img}
                                onClick={() => onUpdate({ type: opt.value.type })}
                                isActive={joint.type === opt.value.type}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="text-sm mb-2">Link (ejemplo: longitud)</div>
                    <input
                        type="number"
                        placeholder="Length (mm)"
                        value={joint.link.length ?? ""}
                        onChange={(e) => onUpdate({ link: { ...(joint.link || {}), length: e.target.value ? Number(e.target.value) : null } })}
                        className="border p-2 rounded w-40"
                    />
                </div>

                <div>
                    <div className="text-sm mb-2">Límites (min / max)</div>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="min"
                            value={joint.limits.min ?? ""}
                            onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), min: e.target.value ? Number(e.target.value) : null } })}
                            className="border p-2 rounded w-28"
                        />
                        <input
                            type="number"
                            placeholder="max"
                            value={joint.limits.max ?? ""}
                            onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), max: e.target.value ? Number(e.target.value) : null } })}
                            className="border p-2 rounded w-28"
                        />
                    </div>
                </div>

            </div>
        );
    }

    /* --------------------------
       Render principal
       -------------------------- */
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

                    <div className="flex flex-1 p-6">
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

                    <div className="flex border-t p-6 flex-row justify-end gap-6 text-xl"
                        style={{ borderColor: colors.border }}>
                        {currentStep !== 0 && <button className="cursor-pointer py-2 px-4 opacity-80 hover:opacity-100"
                            onClick={() => {
                                if (currentStep === 0) return;
                                setCompletedSteps(prev => prev.slice(0, currentStep - 1));
                                setCurrentStep(currentStep - 1);
                            }}>
                            Atrás
                        </button>}

                        <button className="primaryButton py-2 px-4 rounded-md"
                            onClick={() => {
                                if (currentStep >= buildSteps.length - 1) {
                                    console.log("Construir robotConfig.json", wizardState);
                                    return;
                                }
                                setCompletedSteps(prev => [
                                    ...prev,
                                    buildSteps[currentStep].id
                                ]);
                                setCurrentStep(currentStep + 1);
                            }}>
                            {currentStep === buildSteps.length - 1 ? "Finalizar" : "Siguiente"}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default RobotBuildingModal;
