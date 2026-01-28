import CustomScroll from "../../ui/scrolls/CustomScroll";
import BuildCard from "./BuildCard";
import { useTheme } from "../../../context/themes/ThemeContext";
/* --------------------------
       JointEditor subcomponente (simple)
       - Permite seleccionar tipo de joint usando tus BuildCard
       - Muestra inputs simples para link.length y límites como ejemplo
       -------------------------- */
function JointEditor({ joint, jointOptions = [], linkOptions = [], onUpdate }) {
    if (!joint) return null;
    const { colors } = useTheme()
    return (
        <div className="flex h-full flex-col gap-4">
            <CustomScroll
                className="p-2"
                scrollbarColor={colors.scrollbar.track}
                thumbColor={colors.scrollbar.thumb}>
                <h4 className="font-bold px-2 text-2xl">Editar Joint</h4>
                <div className="p-2">
                    <div className="text-lg mb-2">Tipo de articulación</div>
                    <div className="grid grid-cols-3 gap-4">
                        {jointOptions.map((opt, i) => (
                            <BuildCard
                                key={i}
                                label={opt.label}
                                imgSrc={opt.img}
                                onClick={() => onUpdate({ type: opt.value.type })}
                                size="sm"
                                isActive={joint.type === opt.value.type}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-2">
                    <div className="text-lg mb-2">Tipo de link</div>
                    <div className="grid grid-cols-3 gap-4">
                        {linkOptions.map((opt, i) => (
                            <BuildCard
                                key={i}
                                label={opt.label}
                                imgSrc={opt.img}
                                onClick={() => onUpdate({ link: opt.value.type })}
                                size="sm"
                                isActive={joint.link === opt.value.type}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex flex-1 flex-col gap-2 p-2 text-lg">
                        <div className="flex flex-col gap-2">
                            <h4>Límite mínimo</h4>
                            <input
                                type="text"
                                placeholder="min"
                                value={joint.limits.min ?? ""}
                                onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), min: e.target.value ? Number(e.target.value) : null } })}
                                className="border p-2 rounded"
                                style={{ borderColor: colors.border }}

                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4>Límite máximo</h4>
                            <input
                                type="text"
                                placeholder="max"
                                value={joint.limits.max ?? ""}
                                onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), max: e.target.value ? Number(e.target.value) : null } })}
                                className="border p-2 rounded"
                                style={{ borderColor: colors.border }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4>Posición default (zero)</h4>
                            <input
                                type="text"
                                placeholder="max"
                                value={joint.limits.default ?? ""}
                                onChange={(e) => onUpdate({limits: {...(joint.limits || {}), default: e.target.value ? Number(e.target.value): null}})}
                                className="border p-2 rounded"
                                style={{ borderColor: colors.border }}
                            />
                        </div>
                    </div>
                </div>
            </CustomScroll>
        </div>
    )
}

export default JointEditor;