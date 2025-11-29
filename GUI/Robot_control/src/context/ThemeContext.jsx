import React, { Children } from 'react'
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("light")
    const theme = {
        colors: {
            background: mode === "light" ? "#ffffff" : "#02040f",
            primary: mode === "light" ? "#6d40d8" : "#8c6cd6",
            primaryDark: mode === "light" ? "#5a2ac9" : "#6b4bb8",
            accent: mode === "light" ? "#1e293b" : "#2b384e",
            danger: mode === "light" ? "#cf2e2e" : "#ca3838",
            border: mode === "light" ? "#cacaca" : "#242a42",

            text: {
                primary: mode === "light" ? "#747474" : "#f8f8f8",
                title: mode === "light" ? "#7e848d" : "#c3cbd7",
            },
            terminal: {
                head: mode === "light" ? "#1f1f1f" : "#070707ff",
                content: mode === "light" ? "#111111" : "#000000"
            },
            axes: {
                X: "#ff4f4f",
                Y: "#3fcc3f",
                Z: "#3b59e0",
            }
        },

        mode,
        setMode,
    };
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)