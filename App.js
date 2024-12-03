import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'

import Onboard from './app/onboard'
import Router from './app/Router'
import { getInitialSystemVariables, setUserInformationInLocalStorage } from './app/utils/localStorage'
import { StatusBar } from 'expo-status-bar'
import { getUserInformationFromUUID, initSession } from './app/utils/authenticate'
import { createStackNavigator } from '@react-navigation/stack'
import { StyleSheet } from 'react-native'
import { gen, currentTheme } from './app/utils/styling/colors'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null)
  const [isOnboardComplete, setIsOnboardComplete] = useState(false)
  const [session, setSession] = useState(null)
  const [loaded, error] = useFonts({
    'nunito-light': require('./assets/fonts/nunito-light.ttf'),
    'nunito-light-italic': require('./assets/fonts/nunito-light-italic.ttf'),
    'nunito-regular': require('./assets/fonts/nunito-regular.ttf'),
    'nunito-bold': require('./assets/fonts/nunito-bold.ttf'),
    'nunito-bold-italic': require('./assets/fonts/nunito-bold-italic.ttf'),
  })

  useEffect(() => {
    const getSession = async () => {
      const { firstLaunch } = await getInitialSystemVariables()
      setIsFirstLaunch(firstLaunch)

      // GET SESSION
      const result = await initSession()
      setSession(result)

      // REFRESH USER INFORMATION
      const { id, uui, created_at, email, fname, lname, goal, phone_number, plan_id, avatar_path, last_active } = await getUserInformationFromUUID(result.user.id)
      await setUserInformationInLocalStorage({id, uui, created_at, email, fname, lname, goal, phone_number, plan_id, avatar_path, last_active})
    }
    getSession()
  }, [])

  useEffect(() => {
    if (loaded || error) {
      const loadTimeout = setTimeout(async () => {
        SplashScreen.hideAsync()
        clearTimeout(loadTimeout)
      }, 1000)

      return () => {
        clearTimeout(loadTimeout)
      }
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView>
          {
            isFirstLaunch && !isOnboardComplete
              ? <Onboard setIsOnboardComplete={setIsOnboardComplete} setSession={setSession} /> 
              : session
                ? <Router />
                : <Text>LOG IN FOOL</Text>
          }
      </GestureHandlerRootView>
      <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})