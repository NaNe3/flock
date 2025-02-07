import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../hooks/ThemeProvider";

export default function MapLine() {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.lineContainer}>
      <View style={styles.line} />
      <View style={styles.line} />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    lineContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    line: {
      width: 5,
      height: 20,
      borderRadius: 10,
      marginVertical: 3,
      backgroundColor: theme.primaryBorder,
    }
  })
}