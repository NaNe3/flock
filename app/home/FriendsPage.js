import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

import { useTheme } from "../hooks/ThemeProvider"

export default function FriendsPage({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    }
  })
}