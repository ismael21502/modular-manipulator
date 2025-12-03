import { useTheme } from '../context/ThemeContext';
function Log({ time, type, content }) {
    const { colors } = useTheme()
    const typeColors = {
        'INFO': "text-[#02BF3A]",
        'WARNING': "text-[#FAE700]",
        'ERROR': "text-[#E00025]",
        'DEBUG': "text-[#00FFFF]", 
    };
    const typeColors2 = {
        'INFO': colors.success,
        'WARNING': colors.warning,
        'ERROR': colors.danger,
        'DEBUG': colors.primary, //Cambiar después
    }
    const colorClass = typeColors[type] || "text-gray-400"; // default
    const spanColor = typeColors2[type] || "#afafaf"
    return (
        <p className='text-sm'>{time} <span style={{color: spanColor}}>[{type}]</span> {content} </p>
    )
}

export default Log
