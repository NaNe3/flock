import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './home/HomePage'
import FriendsPage from './home/FriendsPage';
import LibraryPage from './home/LibraryPage'

import InteractiveHeaderBar from './components/InteractiveHeaderBar'
import NavigationBar from './components/NavigationBar';
import { useTheme } from './hooks/ThemeProvider';
import { forPushFromLeft } from './utils/interpolations/forPushFromBottom';

const Stack = createStackNavigator()

export default function Home({ currentRoute, setCurrentRoute }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <InteractiveHeaderBar />
      <Stack.Navigator 
        initialRouteName='Home'
        screenOptions={({ route }) => ({
          cardStyle: { backgroundColor: theme.primaryBackground },
          headerShown: false,
          animationEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: forPushFromLeft
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomePage}
        />
        {/* <Stack.Screen
          name="GroupPage"
          component={GroupPage}
        /> */}
        <Stack.Screen
          name="FriendsPage"
          component={FriendsPage}
          options={{ unmountOnBlur: false }}
        />
        <Stack.Screen
          name="LibraryPage" 
          component={LibraryPage} 
        />
      </Stack.Navigator>
      <NavigationBar
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
      />
    </View>
  );
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
  })
}