import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Goals from '../onboard/Goals'
import Planify from '../onboard/Planify'
import Commitment from '../onboard/Commitment'

export default function CreatePlan({ navigation }) {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [planData, setPlanData] = useState({
    goal: null,
    plan: null,
  })

  const props = {
    setCurrentScreen,
    planData,
    setPlanData,
  }

  const screens = [
    <Goals {...props} />,
    <Planify {...props} />,
    <Commitment {...props} />,
  ]

  useEffect(() => {
    if (currentScreen > screens.length) {
      navigation.goBack()
    }
  }, [currentScreen])

   return (
    <View style={styles.container}>
      {screens[currentScreen-1]}
    </View>
   )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
