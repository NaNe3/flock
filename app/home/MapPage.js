import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from "../hooks/ThemeProvider"
import Icon from 'react-native-vector-icons/FontAwesome5'

import MapBlock from "./components/MapBlock"
import { hapticSelect } from "../utils/haptics"

export default function MapPage({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <View style={styles.landingContainer}>
        <TouchableOpacity
          style={styles.planContainer}
          activeOpacity={0.7}
          onPress={() => {
            hapticSelect()
          }}
        >
          <View style={styles.planContentContainer}>
            <View style={styles.planBox}>
              <Text style={styles.planArt}>Come</Text>
              <Text style={styles.planArt}>Follow</Text>
              <Text style={styles.planArt}>Me</Text>
            </View>
            <Text style={styles.planText}>
              Come Follow Me <Icon name="chevron-down" size={20} color={theme.actionText} />
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer}>
        <MapBlock navigation={navigation} />
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    landingContainer: {
      backgroundColor: theme.primaryBackground,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    planContainer: {
      paddingBottom: 10,
      paddingHorizontal: 5,
      height: 75,
    },
    planContentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planText: {
      fontSize: 25,
      fontFamily: 'nunito-bold',
      color: theme.actionText,
    },
    planBox: {
      backgroundColor: theme.maroon,
      width: 35,
      height: 35,
      borderRadius: 20,
      marginRight: 5,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planArt: {
      color: theme.orange,
      fontSize: 6,
      fontFamily: 'nunito-bold',
      textAlign: 'center',
    }
  })
}