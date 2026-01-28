import { useTheme } from '../../../context/themes/ThemeContext';
function Log({ time, type, content }) {
    const { colors } = useTheme()
    const typeColors = {
        'INFO': colors.success,
        'WARNING': colors.warning,
        'ERROR': colors.danger,
        'DEBUG': colors.primary, //Cambiar después
    }
    const spanColor = typeColors[type] || "#afafaf"
    return (
        <p className='text-sm'>{new Date(time).toLocaleTimeString()} <span style={{color: spanColor}}>[{type}]</span> {content} </p>
    )
}

export default Log
