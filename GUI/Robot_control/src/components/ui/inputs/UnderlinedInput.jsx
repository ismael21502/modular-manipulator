function UnderlinedInput({
    value,
    onChange,
    unselectedColor = "transparent",
    selectedColor = "transparent",
    className = "",
    inputClassName = "",
    placeholder = "",
    style = {},
}) {
    return (
        <div className={`relative inline-block group ${className}`}
            style={{ boxShadow: `inset 0 -1px 0 ${unselectedColor}`, ...style }}>
            <span
                className="invisible whitespace-pre font-inherit"
            >
                {value || placeholder || " "}
            </span>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`absolute w-full left-0 outline-none bg-transparent ${inputClassName}`}

            />
            <span
                className="absolute left-0 bottom-0 h-0.5 w-0 transition-all group-focus-within:w-full duration-300 z-1000"
                style={{ backgroundColor: selectedColor }}
            />
        </div>
    )
}
  
export default UnderlinedInput