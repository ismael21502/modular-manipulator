import React from 'react'
import DoneIcon from '@mui/icons-material/Done';
import { useTheme } from '../context/ThemeContext';

function PositionsCard({ isActive = false, position, setSelected = () =>{} }) {
    const { colors } = useTheme()

    const inactiveColor = "#4b5563"; // gray-600

    const textColor = isActive ? colors.base : inactiveColor;
    const backgroundColor = isActive
        ? `${colors.base}1A` // 10% opacity
        : ``;

    return (
        <button onClick={()=>{setSelected(position.name)}}>
            <div
                className="flex w-full flex-row items-center rounded-xl p-4 gap-3 cursor-pointer"
                style={{ border: `1px solid ${isActive ? colors.base : colors.border}`, backgroundColor }}
            >
                <div className="flex flex-col flex-1 min-w-0 gap-3">
                    {/* Nombre */}
                    <p
                        className="truncate text-sm font-bold text-start"
                        style={{ color: textColor }}
                    >
                        {position.name}
                    </p>

                    {/* Joints */}
                    <div
                        className="truncate text-sm text-start"
                        style={{ color: colors.text.primary }}
                        title={position.joints.names
                            .map((name, i) => `${name}:${position.joints.values[i]}${name === "G" ? "%" : "°"}`)
                            .join(" · ")}
                    >
                        {position.joints.names
                            .map((name, i) => `${name}:${position.joints.values[i]}${name === "G" ? "%" : "°"}`)
                            .join(" ")}
                    </div>
                </div>

                {isActive && (
                    <div
                        className="flex w-6 h-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.base }}
                    >
                        <DoneIcon style={{ color: "white", fontWeight: "bold" }} fontSize="small" />
                    </div>
                )}
            </div>
        </button>

    );
}

export default PositionsCard;
  

