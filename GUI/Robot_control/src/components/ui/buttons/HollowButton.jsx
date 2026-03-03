import '../../../buttons.css'
function HollowButton({ IconComponent, iconSx, iconClass, text, color = "#000", borderColor = "#000", bgColor = "#000", onClick, className="" }) {
    //Use bgColor prop
    return (
        <button className={`hollowButton flex flex-1 p-2 justify-center items-center gap-1 cursor-pointer rounded-md border-1 ${className}`}
            style={{
                '--hollow-color': color,
                '--hollow-borderColor': borderColor,
                '--hollow-bg': bgColor
            }}
            onClick={onClick}>
            <div className={iconClass}>
                {IconComponent && <IconComponent sx={iconSx} />}
            </div>
            <p>{text}</p>
        </button>
    )
}

export default HollowButton