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
            accent: mode === "light" ? "#cf871b" : "#df9424",
            // accent: mode === "light" ? "#1e293b" : "#2b384e",
            danger: mode === "light" ? "#cf2e2e" : "#ca3838",
            warning: mode === "light" ? "#dfc223ff" : "#e6d925ff",
            success: mode === "light" ? "#33cf2e" : "#49ca38",
            border: mode === "light" ? "#cacaca" : "#242a42",
            disabled: "#a5a5a5ff",
            text: {
                primary: mode === "light" ? "#4d4d4dff" : "#f8f8f8",
                title: mode === "light" ? "#505761ff" : "#c3cbd7",
            },
            terminal: {
                head: mode === "light" ? "#1f1f1f" : "#070707ff",
                content: mode === "light" ? "#111111" : "#000000"
            },
            axes: {
                x: "#ff4f4f",
                y: "#3fcc3f",
                z: "#3b59e0",
            }
        },

        mode,
        setMode,
    };
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