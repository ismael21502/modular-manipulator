import CustomScroll from "../../ui/scrolls/CustomScroll";
import BuildCard from "./BuildCard";
import { useTheme } from "../../../context/themes/ThemeContext";
import validateNumber from "../../../utils/validate";
import FloatingInput from "../../ui/inputs/FloatingInput";
/* --------------------------
       JointEditor subcomponente (simple)
       - Permite seleccionar tipo de joint usando tus BuildCard
       - Muestra inputs simples para link.length y límites como ejemplo
       -------------------------- */
function JointEditor({ joint, jointOptions = [], linkOptions = [], onUpdate }) {
    if (!joint) return null
    const { colors } = useTheme()
    return (
        <div className="flex h-full flex-col gap-4">
            <CustomScroll
                className="p-2"
                scrollbarColor={colors.scrollbar.track}
                thumbColor={colors.scrollbar.thumb}>
                <h4 className="font-bold px-2 text-2xl">Editar Joint</h4>
                <div className="p-2">
                    <h4 className="text-lg mb-2">Tipo de articulación</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Para estas cards creo que vale la pena hacer un carousel o algo así */}
                        {jointOptions.map((opt, i) => (
                            <BuildCard
                                key={opt.id}
                                label={opt.label}
                                imgSrc={opt.img}
                                onClick={() => {
                                    onUpdate({ id: opt.id })
                                }}
                                size="sm"
                                isActive={joint.id === opt.id}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-2">
                    <h4 className="text-lg mb-2">Tipo de link</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {linkOptions.map((opt, i) => (
                            <BuildCard
                                key={i}
                                label={opt.label}
                                imgSrc={opt.img}
                                onClick={() => onUpdate({ link: opt.id })}
                                size="sm"
                                isActive={joint.link === opt.id}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-2">
                    <h4 className="text-lg mb-2">Límites</h4>
                    <div className="flex flex-1 flex-row gap-2 p-2 text-lg">
                        <div className="flex flex-col gap-2">
                            {/* <h4>Límite mínimo</h4> */}
                            <FloatingInput
                                value={joint.limits.min ?? ""}
                                label="Min"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                primaryColor={colors.primary}
                                textColor={colors.text.primary}
                                onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), min: e.target.value ? validateNumber(e.target.value, -360, 360) : null } })}
                                // className="border p-2 rounded"
                                style={{ borderColor: colors.border }}
                            />                            
                        </div>
                        <div className="flex flex-col gap-2">
                            {/* <h4>Límite máximo</h4> */}
                            <FloatingInput
                                value={joint.limits.max ?? ""}
                                label="Max"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                primaryColor={colors.primary}
                                textColor={colors.text.primary}
                                onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), max: e.target.value ? validateNumber(e.target.value, -360, 360) : null } })}
                                // className="border p-2 rounded"
                                style={{ borderColor: colors.border }}
                            />                            
                        </div>
                        <div className="flex flex-col gap-2">
                            {/* <h4>Posición default (zero)</h4> */}
                            <FloatingInput
                                value={joint.limits.default ?? ""}
                                label="Default"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                primaryColor={colors.primary}
                                textColor={colors.text.primary}
                                onChange={(e) => onUpdate({ limits: { ...(joint.limits || {}), default: e.target.value ? validateNumber(e.target.value, joint.limits.min, joint.limits.max) : null } })}
                                // className="border p-2 rounded"
                                style={{ borderColor: colors.border }}
                            />                                                       
                        </div>
                    </div>
                </div>
            </CustomScroll>
        </div>
    )
}

export default JointEditor