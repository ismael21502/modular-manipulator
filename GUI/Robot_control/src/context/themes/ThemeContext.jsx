import { createContext, useContext, useState } from 'react'

//[ ] Add useMemo to optimize theme building

const withAlpha = (hex, alpha) => `${hex}${alpha}` //[ ] Improve this function

const colorPalettes = {
    purple: {
        light: {
            primary: "#6d40d8",
            primaryDark: "#5a2ac9",
            accent: "#d89a27",
        },
        dark: {
            primary: "#7b4af0",
            primaryDark: "#6a3cdc",
            accent: "#e0a631",
        },
    },

    blue: {
        light: {
            primary: "#3562c4",
            primaryDark: "#2451b3",
            accent: "#d82d27",
        },
        dark: {
            primary: "#5078ff",
            primaryDark: "#4070d8",
            accent: "#e03131",
        },
    },

    cyan: {
        light: {
            primary: "#2eabaf",
            primaryDark: "#22a398",
            accent: "#d46018",
        },
        dark: {
            primary: "#31c7b3",
            primaryDark: "#2aa090",
            accent: "#df6d26",
        },
    },

    orange: {
        light: {
            primary: "#d36606",
            primaryDark: "#c0610e",
            accent: "#0aa812",
        },
        dark: {
            primary: "#e07b23",
            primaryDark: "#ce6e1a",
            accent: "#2bda34",
        },
    },

    green: {
        light: {
            primary: "#15b846",
            primaryDark: "#109437",
            accent: "#6d40d8",
        },
        dark: {
            primary: "#19b447",
            primaryDark: "#1b9c42",
            accent: "#7b4af0",
        },
    },
    
    red: {
        light: {
            primary: "#d82d27",
            primaryDark: "#c22621",
            accent: "#3562c4",
        },
        dark: {
            primary: "#e03131",
            primaryDark: "#ca2929",
            accent: "#5078ff",
        },
    },
}

const baseThemes = {
    light: {
        background: "#ffffff",
        backgroundSubtle: "#fdfdfd",

        danger: "#d64545",
        dangerDark: "#c53030",
        warning: "#e2c848",
        success: "#3fcc3f",

        border: "#d4d4d4",
        disabled: "#9e9e9e",

        text: {
            primary: "#3d3d3d",
            secondary: "#414a66ff",
            title: "#505a68",
        },

        terminal: {
            head: "#1a1a1a",
            content: "#0f0f0f",
        },

        scrollbar: {
            track: "#0000001e",
        },

    },

    dark: {
        background: "#0c0f1a",
        backgroundSubtle: "#0e121f",

        danger: "#e05454",
        dangerDark: "#b62f2f",
        warning: "#e8d256",
        success: "#53d653",

        border: "#2e3650",
        disabled: "#9e9e9e",

        text: {
            primary: "#f2f2f2",
            secondary: "#424d70ff",
            title: "#c5cfdb",
        },

        terminal: {
            head: "#050505",
            content: "#000000",
        },

        scrollbar: {
            track: "#ffffff10",
        },
    },
}


const buildTheme = (mode, mainColorName) => {
    const base = baseThemes[mode]
    const palette = colorPalettes[mainColorName][mode]

    return {
        colors: {
            ...base,

            primary: palette.primary,
            primaryDark: palette.primaryDark,
            accent: palette.accent,

            scrollbar: {
                ...base.scrollbar,
                thumb: `${palette.primary}${mode === "light" ? "DD" : "AA"}`,
            },

            axes: {
                x: "#ff5c5c",
                y: "#45d445",
                z: "#5078ff",
            },
        },
    }
}
const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("light")
    const [mainColorName, setMainColorName] = useState("purple")

    const theme = buildTheme(mode, mainColorName)

    // This is for color selection in config
    const colorOptions = Object.entries(colorPalettes).map(
        ([name, modes]) => ({
            name,
            ...modes[mode],
        })
    )

    const value = {
        ...theme,
        mode,
        setMode,
        mainColorName,
        setMainColorName,
        withAlpha,
        colorOptions
    }

    return (
        <ThemeContext.Provider value={value}>
            <div
                style={{
                    "--primary": theme.colors.primary,
                    "--primaryDark": theme.colors.primaryDark,
                    "--border": theme.colors.border,
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)