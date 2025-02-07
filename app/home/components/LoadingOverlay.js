import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import hexToRgba from "../../utils/hexToRgba";
import { useTheme } from "../../hooks/ThemeProvider";

export default function LoadingOverlay({ loading }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container} />
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 40,
      overflow: 'hidden',
      backgroundColor: hexToRgba(theme.primaryBackground, 0.8),

      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#fff',
      fontSize: 20,
      fontFamily: 'nunito-bold'
    }
  })
}