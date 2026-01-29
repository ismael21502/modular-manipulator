import '../../../buttons.css'
function SolidButton({text, className, borderColor, bgColor, color, IconComponent, onClick, disabled=false }) {
  return (
    <button className={`solidButton flex flex-1 p-2 justify-center gap-1 cursor-pointer rounded-md border-1 items-center ${className}`}
      style={{ borderColor: borderColor, backgroundColor: bgColor, color: color }}
      onClick={onClick}
      disabled={disabled}>
      {IconComponent && <IconComponent />}
      <p>{text}</p>
    </button>
  )
}

export default SolidButton