import { useTheme } from "../../../context/ThemeContext.jsx"
import Scene from "../3D/Scene.jsx"
import CustomScroll from "../../ui/scrolls/CustomScroll.jsx"

function Select({ title, children }) {
  const { colors } = useTheme()
  return (
    // <Scene/>
    <div className="flex flex-1 flex-col text-3xl font-bold p-8 gap-8"
      style={{ color: colors.text.title }}>
      <h1>{title}</h1>
      <div className="flex flex-row gap-4">
        {children}
        {/* Add scroll */}
      </div>
    </div>
  )
}

export default Select