import { useTheme } from "../../../context/ThemeContext"

function BuildCard({ label, imgSrc, onClick = {}, isActive=false}) {
    const { colors } = useTheme()
    return (
        <div className={`flex flex-1 flex-col rounded-md border gap-4 p-4 cursor-pointer hover:ring-2 ring-[var(--primary)] ${isActive ? "ring-2" : ""}`}
            style={{ borderColor: colors.border, backgroundColor: isActive ? `${colors.primary}1A` : "transparent"}}
            onClick={onClick}>
            <div className="flex justify-center items-center h-40">
                <img src={imgSrc} className="h-full object-contain rounded-md" />
            </div>
            <p className="text-2xl"
            style={{color: colors.text.prmary}}>{label}</p>
        </div>
    )
}

export default BuildCard