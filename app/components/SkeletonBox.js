import { StyleSheet, View } from "react-native"
import { useTheme } from "../hooks/ThemeProvider"
import { useEffect, useState } from "react"

export default function SkeletonBox({ style }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(getStyle(theme))
  useEffect(() => { setStyles(getStyle(theme)) }, [theme])

  return <View style={[style, styles.skeletonStyles]} />
}

function getStyle(theme) {
  return StyleSheet.create({
    skeletonStyles: { 
      backgroundColor: theme.tertiaryBackground,
    }
  })
}