import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'

import Onboard from './app/onboard'
import Router from './app/Router'
import SignIn from './app/SignIn'
import { finishOnboarding, getInitialSystemVariables, setLocallyStoredVariable } from './app/utils/localStorage'
import { StatusBar } from 'expo-status-bar'
import { initSession, setUserInformationFromUUID } from './app/utils/authenticate'
import { createStackNavigator } from '@react-navigation/stack'
import { StyleSheet } from 'react-native'
import { gen, currentTheme } from './app/utils/styling/colors'
import GetStarted from './app/onboard/GetStarted'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

function AppContent() {
  const insets = useSafeAreaInsets()
  const [isOnboardComplete, setIsOnboardComplete] = useState(false)
  const [session, setSession] = useState(null)

  const [hasAlreadyCheckedSession, setHasAlreadyCheckedSession] = useState(false)

  const [loaded, error] = useFonts({
    'nunito-light': require('./assets/fonts/nunito-light.ttf'),
    'nunito-light-italic': require('./assets/fonts/nunito-light-italic.ttf'),
    'nunito-regular': require('./assets/fonts/nunito-regular.ttf'),
    'nunito-bold': require('./assets/fonts/nunito-bold.ttf'),
    'nunito-bold-italic': require('./assets/fonts/nunito-bold-italic.ttf'),
  })

  useEffect(() => {
    const getSession = async () => {
      // await setLocallyStoredVariable('onboarding_complete', 'true')
      const { onboarded } = await getInitialSystemVariables()
      setIsOnboardComplete(onboarded)

      // GET SESSION
      const result = await initSession()
      if (result !== null) {
        await setUserInformationFromUUID(result.user.id)
      }
      setSession(result)
      setHasAlreadyCheckedSession(true)
    }
    getSession()
  }, [])

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView>
        {!isOnboardComplete ? (
          <Onboard setSession={setSession} setIsOnboardComplete={setIsOnboardComplete} />
        ) : session ? (
          <Router />
        ) : (
          hasAlreadyCheckedSession && <SignIn setSession={setSession} />
        )}
      </GestureHandlerRootView>
      <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})