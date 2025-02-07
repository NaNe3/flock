import { createContext, useContext, useEffect, useState } from "react";
import { getLocallyStoredVariable, setLocallyStoredVariable } from "../utils/localStorage";
import { themes } from "../utils/styling/colors";

const ThemeContext = createContext()

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState()
  const [currentTheme, setCurrentTheme] = useState('light')

  const changeTheme = async (theme) => {
    await setLocallyStoredVariable('user_theme', theme)
    setCurrentTheme(theme)
    setTheme(themes[theme])
  }

  useEffect(() => {
    const init = async () => {
      const theme = await getLocallyStoredVariable('user_theme')
      if (theme === null) {
        await setLocallyStoredVariable('user_theme', 'light')
      }
      setCurrentTheme(theme ?? 'light')
      setTheme(themes[theme ?? 'light'])
      // const fakeTheme = 'dark'
      // setCurrentTheme(fakeTheme)
      // setTheme(themes[fakeTheme])
    }

    init()
  }, [])

  return <ThemeContext.Provider value={{ theme, currentTheme, changeTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  return useContext(ThemeContext)
}