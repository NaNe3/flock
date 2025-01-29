import { createContext, useContext, useEffect, useState } from "react";
import { getLocallyStoredVariable, setLocallyStoredVariable } from "../utils/localStorage";
import { themes } from "../utils/styling/colors";

const ThemeContext = createContext()

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState()
  const [currentTheme, setCurrentTheme] = useState('light')

  useEffect(() => {
    const init = async () => {
      const theme = await getLocallyStoredVariable('user_theme')
      if (theme === null) {
        await setLocallyStoredVariable('user_theme', 'light')
      }
      setCurrentTheme(theme ?? 'light')
      setTheme(themes[theme ?? 'light'])
    }

    init()
  }, [])

  return <ThemeContext.Provider value={{ theme, currentTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  return useContext(ThemeContext)
}