import React from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

function Tab({ isActive = false, name, label, setSelected = () => { } }) {
    const { colors } = useTheme()
    return (
        <div className="w-full relative group">
            <button className='w-full cursor-pointer' onClick={() => { setSelected(name) }}
            >
                <div
                    className={`w-full py-3`}
                    style={isActive ? {
                        backgroundColor: `${colors.primary}1A`,
                        color: colors.primary,
                        borderBottom: '4px solid',
                        borderColor: colors.primary,
                        fontWeight: 'bold'
                    } : {}}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = isActive ? colors.primary : colors.text.title}
                >
                    <p>{label}</p>
                </div>
            </button>
            <span className="absolute left-0 bottom-0 h-[4px] w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: colors.primary }}
            ></span>
        </div>
    )
}

export default Tab