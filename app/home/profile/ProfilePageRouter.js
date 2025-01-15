import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

import { gen } from '../../utils/styling/colors';

import ProfilePage from './ProfilePage'
import ChangeProfileName from './ProfileSettings/ChangeProfileName';
import ChangeProfilePicture from './ProfileSettings/ChangeProfilePicture';
import ChangeProfileColor from './ProfileSettings/ChangeProfileColor';

const Stack = createStackNavigator()

export default function GroupDetailsRouter() {

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})