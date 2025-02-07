import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

import ProfilePage from './ProfilePage'
import ChangeProfileName from './ProfileSettings/ChangeProfileName';
import ChangeProfilePicture from './ProfileSettings/ChangeProfilePicture';
import ChangeProfileColor from './ProfileSettings/ChangeProfileColor';
import { useTheme } from '../../hooks/ThemeProvider';
import { useEffect, useState } from 'react';

const Stack = createStackNavigator()

export default function GroupDetailsRouter() {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <Stack.Navigator initialRouteName='ProfilePage'>
        <Stack.Screen
          name="ProfilePage"
          component={ProfilePage}
          options={{ headerShown: false, animationEnabled: true}}
        />
        <Stack.Screen
          name="ChangeProfileName"
          component={ChangeProfileName}
          options={{ headerShown: false, animationEnabled: true}}
        />
        <Stack.Screen
          name="ChangeProfilePicture"
          component={ChangeProfilePicture}
          options={{ headerShown: false, animationEnabled: true}}
        />
        <Stack.Screen
          name="ChangeProfileColor"
          component={ChangeProfileColor}
          options={{ headerShown: false, animationEnabled: true}}
        />
      </Stack.Navigator>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
  })
}