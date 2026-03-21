import { useState } from "react";
import { useTheme } from "../../../context/themes/ThemeContext";
import Select from "./Select";
import IconInput from "../../ui/inputs/IconInput.jsx";
import FloatingInput from "../../ui/inputs/FloatingInput.jsx";
import LabelIcon from '@mui/icons-material/Label';
import validateNumber from "../../../utils/validate.js";

function FinalConfigurationPanel({ step, wizardState, dispatch }) {
    const { colors } = useTheme();
    return (
        <Select title={step.content.title} subtitle={step.content.subtitle}>
            <div className="flex flex-1 flex-col gap-8 text-xl">
                <div className="flex flex-col flex-1 gap-3 p-5 border rounded-lg"
                    style={{ borderColor: colors.border, background: colors.backgroundSubtle }}>
                    <h1>Nombre del robot</h1>
                    {/* Crear un componente para este tipo de inputs */}
                    <IconInput
                    value={wizardState.name}
                        onChange={(e)=>dispatch({ type: "UPDATE_NAME", newName: e.target.value })}
                        className="text-base"
                        outlineColor={colors.primary}
                        placeholder="Ej. Robot 6 DOF"
                        style={{ color: colors.text.primary }}
                        borderColor={colors.border}
                        iconColor={colors.primary}
                        IconComponent={LabelIcon}
                    />
                </div>
                <div className="flex flex-col flex-1 p-5 border rounded-lg"
                    style={{ borderColor: colors.border, background: colors.backgroundSubtle }}>
                    <div className="flex flex-1 flex-row justify-between items-center">
                        <div className="flex flex-row items-center gap-2">
                            {/* <StraightenIcon style={{ color: colors.accent }} /> */}
                            <h1>Límites cartesianos (mm)</h1>
                        </div>
                        <div className="flex p-2 justify-center items-center rounded-lg text-sm"
                            style={{ color: colors.accent, borderColor: colors.accent, backgroundColor: `${colors.accent}3F`}}>
                            <h1>Zona de seguridad</h1>
                        </div>
                    </div>
                    <div className="flex flex-row w-full py-4 gap-4 text-base">
                        <div className="flex flex-col flex-1 gap-4">
                            <h2 className="text-center">Eje X</h2>
                            <FloatingInput
                                value={wizardState.cartesian[0].min ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "x", payload: { min: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Mínimo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[0].max ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "x", payload: { max: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Máximo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[0].default ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "x", payload: { default: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Default"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                        </div>
                        <div className="flex flex-col flex-1 gap-4">
                            <h2 className="text-center">Eje Y</h2>
                            <FloatingInput
                                value={wizardState.cartesian[1].min ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "y", payload: { min: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Mínimo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[1].max ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "y", payload: { max: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Máximo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[1].default ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "y", payload: { default: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Default"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                        </div>
                        <div className="flex flex-col flex-1 gap-4">
                            <h2 className="text-center">Eje Z</h2>
                            <FloatingInput
                                value={wizardState.cartesian[2].min ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "z", payload: { min: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Mínimo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[2].max ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "z", payload: { max: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Máximo"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                            <FloatingInput
                                value={wizardState.cartesian[2].default ?? ""}
                                onChange={(e)=>dispatch({ type: "UPDATE_CARTESIAN", axisId: "z", payload: { default: e.target.value ? validateNumber(e.target.value, -1000, 1000) : null } })}
                                label="Default"
                                backgroundColor={colors.background}
                                borderColor={colors.border}
                                textColor={colors.text.primary}
                                primaryColor={colors.primary}
                                className="text-base" />
                        </div>
                    </div>
                </div>
            </div>
        </Select>
    )
}

export default FinalConfigurationPanel;
