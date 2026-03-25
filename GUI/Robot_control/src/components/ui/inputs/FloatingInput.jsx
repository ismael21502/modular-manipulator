import { useState } from 'react';

function FloatingInput({
    value,
    onChange,
    label = "",
    type = "text",
    backgroundColor = "#FFF",
    borderColor = "#FFF",
    textColor = "#000000",
    primaryColor = "#FFF", // azul tipo Tailwind
    className = "",
    style = {}
}) {
    const [isFocused, setIsFocused] = useState(false);

    const isActive = isFocused || value !== "" && value !== null && value !== undefined

    return (
        <div
            className={`relative flex flex-1 flex-col justify-center ${className}`}
            style={{ color: textColor, ...style }}
        >
            {/* Label */}
            <div className={`absolute px-1.5 pointer-events-none left-1 transition-transform 
            duration-200 ${value && 'text-xs top-0 -translate-y-1/2'}`} />
            <div
                className={`
          absolute opacity-70 left-2 px-1.5 pointer-events-none
          transition-transform duration-200 ease-out text-inherit
          ${isActive ? 'text-sm top-0 -translate-y-1/2 opacity-100 font-bold' : ''}
        `}
                style={{
                    backgroundColor: isActive ? backgroundColor : 'transparent',
                    color: isFocused ? primaryColor : textColor
                }}
            >
                {label}
            </div>

            {/* Input */}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`
          w-full py-2 px-3.5 border rounded-lg
          focus:outline-2 -outline-offset-2
        `}
                style={{
                    borderColor: isFocused ? primaryColor : borderColor,
                    backgroundColor: backgroundColor,
                    color: textColor,
                    outlineColor: primaryColor
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
}

export default FloatingInput;