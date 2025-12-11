import React, { Children } from 'react'
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("light")
    const theme = {
        colors: {
            background: mode === "light" ? "#ffffff" : "#0c0f1a",

            primary: mode === "light" ? "#6d40d8" : "#7b4af0",
            primaryDark: mode === "light" ? "#5a2ac9" : "#6a3cdc",

            accent: mode === "light" ? "#d89a27" : "#e0a631",

            danger: mode === "light" ? "#d64545" : "#e05454",

            dangerDark: mode === "light" ? "#c53030" : "#b62f2f", 

            warning: mode === "light" ? "#e2c848" : "#e8d256",

            success: mode === "light" ? "#3fcc3f" : "#53d653",

            border: mode === "light" ? "#d4d4d4" : "#2e3650",

            disabled: "#9e9e9e",

            text: {
                primary: mode === "light" ? "#3d3d3d" : "#f2f2f2",
                secondary: mode === "light" ? "#2e3650" : "#424d70ff",
                title: mode === "light" ? "#505a68" : "#c5cfdb",
            },

            terminal: {
                head: mode === "light" ? "#1a1a1a" : "#050505",
                content: mode === "light" ? "#0f0f0f" : "#000000"
            },

            // Ejes con colores más sobrios pero reconocibles
            axes: {
                x: "#ff5c5c",
                y: "#45d445",
                z: "#5078ff",
            }
        },

        mode,
        setMode,
    }
    
    return <ThemeContext.Provider value={theme}
    >
        <div style={{
            "--cardHover": theme.colors.primary,
            "--cardBorder": theme.colors.border,
            "--cardActiveBorder": theme.colors.primary,
        }}>
            {children}
        </div>

    </ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)