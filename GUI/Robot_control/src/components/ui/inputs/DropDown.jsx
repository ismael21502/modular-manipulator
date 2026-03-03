import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect, useRef, useState } from 'react';

function DropDown({ options = [], label, backgroundColor, borderColor, textColor, primaryColor, selectedColor, value, onSelect }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef()
    // [ ] Check for alternatives
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (option) => {
        onSelect(option?.value)
        setIsOpen(false)
    }
    return (
        <div className="relative flex flex-col justify-center w-30"
            style={{ color: textColor }}
            ref={dropdownRef}>
            {/* Label */}
            <div className={`absolute px-1.5 pointer-events-none left-1 transition-transform duration-200 ${value && 'text-xs top-0 -translate-y-1/2'}`}
                style={{ backgroundColor: value ? backgroundColor : 'transparent' }}>
                {label}
            </div>
            {/* Select button */}
            <button className='flex w-full items-center justify-between p-1 pl-3 border rounded hover:outline-2 hover:cursor-pointer focus:outline-2 gap-2'
                style={{ borderColor: borderColor, backgroundColor: backgroundColor, outlineColor: primaryColor }}
                onClick={() => setIsOpen(!isOpen)}>
                <span>{value}</span>
                <span className={`transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'
                    }`} ><ExpandMoreIcon />
                </span>

            </button>
            {/* Options */}
            <ul className={`absolute top-full mt-2 z-1000 border rounded overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                style={{ borderColor: borderColor, backgroundColor: backgroundColor }}>
                {options.map(option => (
                    <li className='flex'
                        key={option.value}
                    >
                        <button className='flex flex-1 flex-row px-1 py-0.5 pl-3 items-center gap-3 hover:cursor-pointer w-30'
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = primaryColor
                                e.currentTarget.style.color = selectedColor
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor
                                e.currentTarget.style.color = textColor
                            }}
                            style={{ backgroundColor: backgroundColor, color: textColor }}
                            onClick={() => handleSelect(option)} >
                            {option.label}
                            {/* {option.value === selected.value && <CheckIcon fontSize='small' className='' />} */}

                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default DropDown