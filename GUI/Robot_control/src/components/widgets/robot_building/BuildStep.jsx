import { useTheme } from '../../../context/ThemeContext'
import CheckIcon from '@mui/icons-material/Check';

function BuildStep({title, hint, number, complete=false, isActive=false}) {
    const { colors } = useTheme()
  return (
      <div className={`flex flex-row gap-3 items-center ${isActive ? "opacity-100" : complete ? "opacity-100" : "opacity-70"}`}>
        <span className='flex rounded-full w-10 h-10 text-white items-center justify-center font-bold'
              style={{ backgroundColor: complete ? colors.success : isActive ? colors.primaryDark : colors.text.secondary}}>{complete? <CheckIcon /> :number}</span>
        <div className="flex flex-col">
            <h2 className='font-bold'
            style={{color: colors.text.title}}>{title}</h2>
            <h3>{hint}</h3>
        </div>
    </div>
  )
}

export default BuildStep