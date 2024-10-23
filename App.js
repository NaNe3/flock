import React, { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font'

import Home from './app/home'
import Onboard from './app/onboard'
import { getInitialSystemVariables } from './app/utils/localStorage';

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true)
  const [loaded, error] = useFonts({
    'nunito-regular': require('./assets/fonts/nunito-regular.ttf'),
    'nunito-bold': require('./assets/fonts/nunito-bold.ttf'),
  })

  // useEffect(() => {
  //   const { firstLaunch } = getInitialSystemVariables()
  //   setIsFirstLaunch(firstLaunch ? true : false)
  // }, [])

  useEffect(() => {
    if (loaded || error) {
      const loadTimeout = setTimeout(async () => {
        SplashScreen.hideAsync();
        clearTimeout(loadTimeout);
      }, 1000)

      return () => {
        clearTimeout(loadTimeout);
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isFirstLaunch ? "Onboard" : "AppNavigation"}>
          <Stack.Screen 
            name="Onboard" 
            component={Onboard} 
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AppNavigation"
            component={Home}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
