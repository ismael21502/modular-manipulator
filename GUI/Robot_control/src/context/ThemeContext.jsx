import React, { Children } from 'react'
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({children}) =>{
    const [mode, setMode] = useState("light")
    const theme = {
        colors: {
            background: mode === "light" ? "#ffffff" : "#02040fff",
            base: mode === "light" ? "#6d40d8" : "#8c6cd6",
            base_darker: mode === "light" ? "#6d3be0ff" : "#591aebff",
            accent: mode === "light" ? "#3bb6be" : "#3bd6ee",
            border: mode === "light" ? "#cacaca" : "#242a42ff",
            text: { primary: mode === "light" ? "#747474": "#e0e0e0ff"  },
            terminal: { head: mode === "light" ? "#1f1f1f" : "#070707ff", content: mode === "light" ? "#111111" : "#000000" }
        },
        mode,
        setMode,
    }
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)