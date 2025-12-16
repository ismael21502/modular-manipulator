const validateNumber = (val, min, max) => {
    // const raw = Array.isArray(val) ? val[0] : val
    const raw = String(Array.isArray(val) ? val[0] : val)

    if (raw.includes("-") && raw[0] !== "-") {
        return "-"
    } 

    if (raw === "-") return raw

    if (!/^(-?\d*)$/.test(raw)) {
        return  // Caracter inválido → no actualizar
    }

    if (raw === "") {
        return 0
    }

    const newValue = Number(raw);

    // Si no es número válido → NO actualizar
    if (!Number.isFinite(newValue)) {
        return
    }

    // Clamp
    const clamped = Math.min(Math.max(newValue, min), max)

    return clamped
}
export default validateNumber