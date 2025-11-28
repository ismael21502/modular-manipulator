import React from 'react'
import DoneIcon from '@mui/icons-material/Done';

function PositionsCard({ isActive = true, position }) {

    const activeColor = "#3bb6be";  // indigo-600
    const inactiveColor = "#4b5563"; // gray-600

    const textColor = isActive ? activeColor : inactiveColor;
    const borderColor = isActive ? activeColor : inactiveColor;
    const backgroundColor = isActive
        ? `${activeColor}1A` // 10% opacity
        : ``;
    const badgeColor = activeColor;

    return (
        <div
            className="flex w-full flex-row items-center justify-between rounded-xl p-4 gap-3"
            style={{ border: `1px solid ${borderColor}`, backgroundColor }}
        >
            <div className="flex flex-col flex-1 min-w-0 gap-3">
                {/* Nombre */}
                <p
                    className="truncate text-sm"
                    style={{ color: textColor, fontWeight: isActive ? "bold" : "normal" }}
                >
                    {position.name}
                </p>

                {/* Joints */}
                <div
                    className="truncate text-sm"
                    style={{ color: inactiveColor }}
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
                    style={{ backgroundColor: badgeColor }}
                >
                    <DoneIcon style={{ color: "white", fontWeight: "bold" }} fontSize="small" />
                </div>
            )}
        </div>

    );
}

export default PositionsCard;
  

