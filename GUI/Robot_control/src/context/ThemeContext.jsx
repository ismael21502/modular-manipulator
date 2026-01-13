import React, { Children } from 'react'
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => { 
    const [mode, setMode] = useState("light")
    const mainColorsDict = {
        "purple": {
            primary: mode === "light" ? "#6d40d8" : "#7b4af0",
            primaryDark: mode === "light" ? "#5a2ac9" : "#6a3cdc",
            accent: mode === "light" ? "#d89a27" : "#e0a631",
        },
        "blue": {
            primary: mode === "light" ? "#3562c4" : "#5078ff", 
            primaryDark: mode === "light" ? "#2451b3" : "#4070d8", 
            accent: mode === "light" ? "#d82d27" : "#e03131",
        },
        "orange": {
            primary: mode === "light" ? "#d36606" : "#e07b23",
            primaryDark: mode === "light" ? "#c0610e" : "#ce6e1a",
            accent: mode === "light" ? "#0aa812" : "#2bda34",
        },
        "green": {
            primary: mode === "light" ? "#16ca4c" : "#23da5a",
            primaryDark: mode === "light" ? "#0db940" : "#15c94bff",
            accent: mode === "light" ? "#6d40d8" : "#7b4af0",
        }
    }
    const [mainColorName, setMainColorName] = useState("purple")

    const mainColor = mainColorsDict[mainColorName]

    const changeColor = (colorName) => {
        setMainColorName(colorName)
    }
    // const primary = mode === "light" ? "#6d40d8" : "#7b4af0"
    const theme = {
        colors: {
            background: mode === "light" ? "#ffffff" : "#0c0f1a",
            backgroundSubtle: mode === "light" ? "#fdfdfd" : "#0e121fff",

            primary: mainColor.primary,
            primaryDark: mainColor.primaryDark,

            accent: mainColor.accent,

            danger: mode === "light" ? "#d64545" : "#e05454",

            dangerDark: mode === "light" ? "#c53030" : "#b62f2f", 

            warning: mode === "light" ? "#e2c848" : "#e8d256",

            success: mode === "light" ? "#3fcc3f" : "#53d653",

            border: mode === "light" ? "#d4d4d4" : "#2e3650",

            disabled: "#9e9e9e",

            text: {
                primary: mode === "light" ? "#3d3d3d" : "#f2f2f2",
                secondary: mode === "light" ? "#414a66ff" : "#424d70ff",
                title: mode === "light" ? "#505a68" : "#c5cfdb",
            },

            terminal: {
                head: mode === "light" ? "#1a1a1a" : "#050505",
                content: mode === "light" ? "#0f0f0f" : "#000000"
            },

            scrollbar: {
                track: mode === "light" ? "#0000001e" : "#ffffff10",
                thumb: mode === "light" ? `${mainColor.primary}DD` : `${mainColor.primary}AA`, 
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
        changeColor,
        mainColorName,
    }
    
    return <ThemeContext.Provider value={theme}
    >
        <div style={{
            "--cardHover": theme.colors.primary,
            "--cardBorder": theme.colors.border,
            "--cardActiveBorder": theme.colors.primary,
            "--primary": theme.colors.primary,
            "--primaryDark": theme.colors.primaryDark,
        }}>
            {children}
        </div>

    </ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)