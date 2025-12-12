import React, { useState } from 'react'
import DoneIcon from '@mui/icons-material/Done';
import { useTheme } from '../context/ThemeContext';

function PositionsCard({ isActive = false, name, joints, labels , setSelected = () =>{} }) {
    const { colors } = useTheme()
    const textColor = isActive ? colors.primary : colors.text.title;
    const backgroundColor = isActive
        ? `${colors.primary}1A` // 10% opacity
        : ``;

    return (
        <button onClick={()=>{setSelected(name)}}>
            <div
                className={`card ${isActive? "active": ""} flex w-full flex-row items-center rounded-xl p-4 gap-3 cursor-pointer`}
                style={{ backgroundColor }}
            >
                <div className="flex flex-col flex-1 min-w-0 gap-3">
                    <div className="flex flex-row w-full justify-between">
                        {/* Nombre */}
                        <p
                            className=" text-md font-bold text-start"
                            style={{ color: textColor }}
                        >
                            {name}
                        </p>
                        {isActive && (
                            <div
                                className="flex w-6 h-6 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <DoneIcon style={{ color: "white", fontWeight: "bold" }} fontSize="small" />
                            </div>
                        )}
                    </div>
                    {/* Joints */}
                    <div
                        className="flex flex-row flex-wrap gap-1 justify-between text-sm text-start"
                        style={{ color: colors.text.primary }}
                        // title={position.joints.labels
                        //     .map((label, i) => `${label}: ${position.joints.values[i]}${label === "G" ? "%" : "°"}`)
                        //     .join(" · ")}
                    >
                        {/* {joints
                            .map((joint, i) => `${labels[i]}: ${joint}${labels[i] === "G" ? "%" : "°"}`)
                            .join(" ")} */}
                            {joints.map((joint, i) => (
                                <div key={i} className={`flex flex-1 min-w-[25%] flex-col justify-between rounded-md p-2 border-1 text-xs text-center`}
                                    style={{ 
                                        backgroundColor:  colors.background , 
                                    borderColor: colors.border}}>
                                    <p style={{color: colors.text.secondary, fontWeight: 'bold'}}>{labels[i]}</p>
                                    <p style={{ color: colors.text.primary }}>{joint}{labels[i] === "G" ? "%" : "°"}</p>
                                </div>
                            ))}
                    </div>
                </div>

                
            </div>
        </button>

    );
}

export default PositionsCard;
  

