function InputWithSuffix({
    value,
    suffix = "",
    onChange,
    className = "",
    placeholder = "",
    style = {},
}) {
    return (
        <div className={`relative group ${className}`}
            style={{ ...style }}>
            <div className={`relative inline-block `}>
                <span
                    className="invisible whitespace-pre font-inherit"
                >
                    {value || placeholder || "  "} {suffix}
                </span>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`absolute w-full left-0 outline-none bg-transparent`}
                />
                <span className='absolute right-0 opacity-70'>{suffix}</span>
            </div>
            <span className="inputBorder pointer-events-none" />
        </div>
    )
}

export default InputWithSuffix