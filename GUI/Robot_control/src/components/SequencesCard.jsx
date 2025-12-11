import React from 'react'
import DoneIcon from '@mui/icons-material/Done';
import { useTheme } from '../context/ThemeContext';

function SequencesCard({ isActive = false, sequence, setSelected = () => { } }) {
    const { colors } = useTheme()

    const textColor = isActive ? colors.primary : colors.text.title;
    const backgroundColor = isActive
        ? `${colors.primary}1A` // 10% opacity
        : ``;
    const duration = (sequence.steps.reduce((acc, step) => acc + step.duration + step.delay, 0)/1000).toFixed(2)
    return (
        <button onClick={() => { setSelected(sequence.name) }}>
            <div
                className={`card ${isActive ? "active" : ""} flex w-full flex-row items-center rounded-xl p-4 gap-3 cursor-pointer`}
                style={{ backgroundColor }}
            >
                <div className="flex flex-col flex-1 min-w-0 gap-3">
                    {/* Nombre */}
                    <p
                        className=" text-sm font-bold text-start"
                        style={{ color: textColor }}
                    >
                        {sequence.name}
                    </p>
                    <div className="flex flex-row gap-2 text-sm items-center"
                    style={{color: colors.text.primary}}>
                        <p>{sequence.steps.length} pasos </p>
                        <div style={{backgroundColor: colors.text.primary}} className='rounded-full w-1 h-1'></div>
                        <p>Duración: ~ {duration}s</p>
                    </div>
                    {/* Joints */}
                    {/* <div
                        className="truncate text-sm text-start"
                        style={{ color: colors.text.primary }}
                        title={sequence.joints.labels
                            .map((label, i) => `${label}: ${sequence.joints.values[i]}${label === "G" ? "%" : "°"}`)
                            .join(" · ")}
                    >
                        {sequence.joints.labels
                            .map((label, i) => `${label}: ${sequence.joints.values[i]}${label === "G" ? "%" : "°"}`)
                            .join(" ")}
                    </div> */}
                </div>

                {isActive && (
                    <div
                        className="flex w-6 h-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <DoneIcon style={{ color: "white", fontWeight: "bold" }} fontSize="small" />
                    </div>
                )}
            </div>
        </button>

    );
}

export default SequencesCard;


