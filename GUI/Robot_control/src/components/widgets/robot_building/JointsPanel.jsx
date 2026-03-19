import { useTheme } from "../../../context/themes/ThemeContext";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomScroll from "../../ui/scrolls/CustomScroll.jsx";
import JointEditor from "./JointEditor.jsx";

function JointsPanel({ step, wizardState, dispatch, selectedJointId, setSelectedJointId }) {
    const { colors } = useTheme();

    return (
        <div className="w-full h-full flex">
            {/* LEFT: lista de joints + añadir */}
            <div className="flex flex-col h-full w-1/3">
                <div className="flex items-center justify-between p-4 pb-0 text-2xl">
                    <h3 className="font-bold">Articulaciones</h3>
                    <button
                        className="flex items-center justify-center p-2 opacity-80 hover:opacity-100 cursor-pointer rounded-full"
                        onClick={() => {
                            dispatch({ type: "ADD_JOINT" })
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

export default JointsPanel;
