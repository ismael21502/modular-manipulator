import { useTheme } from "../../../context/themes/ThemeContext.jsx"
import Scene from "../3D/Scene.jsx"
import CustomScroll from "../../ui/scrolls/CustomScroll.jsx"

function Select({ title, subtitle = null, children }) {
  const { colors } = useTheme()
  return (
    // <Scene/>
    <div className="flex flex-1 flex-col text-3xl font-bold p-8 gap-8"
      style={{ color: colors.text.title }}>
      <div className="flex flex-col gap-2">
        <h1>{title}</h1>
        {subtitle && <h2 className="font-normal text-lg"
          style={{ color: colors.text.subtitle }}>{subtitle}</h2>}
      </div>
      <div className="flex flex-row gap-4">
        {children}
        {/* Add scroll */}
      </div>
    </div>
  )
}

export default Select