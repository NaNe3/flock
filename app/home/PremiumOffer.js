import { StyleSheet, View, Text } from "react-native"
import { useTheme } from "../hooks/ThemeProvider"
import { useEffect, useState } from "react"

export default function PremiumOffer({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <Text
        onPress={() => navigation.goBack()}
      >Premium Offer</Text>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primaryBackground,
    }
  })
}