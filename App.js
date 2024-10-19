import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'

import Home from './app/home'
import Onboard from './app/onboard'

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true)

  const [loaded, error] = useFonts({
    'nunito-regular': require('./assets/fonts/nunito-regular.ttf'),
    'nunito-bold': require('./assets/fonts/nunito-bold.ttf'),
  })

  useEffect(() => {
    const checkFirstLaunch = async () => {
      // await AsyncStorage.removeItem('alreadyLaunched')
      await AsyncStorage.getItem('alreadyLaunched').then(value => {
        console.log(value)
        if (value == null) {
          console.log('First Launch')
          setIsFirstLaunch(true)
        } else {
          setIsFirstLaunch(false)
        }
      })
    }

    checkFirstLaunch()
  }, [])

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
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isFirstLaunch ? "Onboard" : "HomeNavigation"}>
        <Stack.Screen 
          name="Onboard" 
          component={Onboard} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeNavigation"
          component={Home}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
