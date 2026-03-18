import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import { contain } from 'three/src/extras/TextureUtils.js';

function IconInput({
  value,
  onChange,
  iconSize = "small",
  borderColor = "#FFF",
  outlineColor = "#FFF",
  iconColor = null,
  placeholder = "",
  className = "",
  style = {},
  IconComponent = null }) {
  const [isFocus, setIsFocus] = useState(false)
  return (
    <div className={`relative ${className}`} style={style}>
      {IconComponent &&
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          <IconComponent fontSize={iconSize} style={{ color: isFocus ? iconColor : null }} />
        </span>}

      <input
        className={`w-full px-3 py-2 border rounded-lg focus:border-transparent -outline-offset-2 focus:outline-2 ${IconComponent ? "pl-8" : ""}`}
        style={{ borderColor: borderColor, outlineColor: outlineColor }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </div>
  )
}

export default IconInput