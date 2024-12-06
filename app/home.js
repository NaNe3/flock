import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './home/HomePage'
import GroupPage from './home/GroupPage'
import InvitePage from './home/InvitePage'
import LibraryPage from './home/LibraryPage'

import InteractiveHeaderBar from './components/InteractiveHeaderBar'
import { View } from 'react-native'
import { StyleSheet } from 'react-native'

import { gen } from './utils/styling/colors'

const Stack = createStackNavigator()

export default function Home() {
  return (
    <View style={styles.container}>
      <InteractiveHeaderBar />
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name="Home"
          component={HomePage}
          options={{ headerShown: false, animationEnabled: false}}
        />
        <Stack.Screen 
          name="GroupPage" 
          component={GroupPage} 
          options={{ headerShown: false, animationEnabled: false }}
        />
        <Stack.Screen
          name="InvitePage"
          component={InvitePage}
          options={{ headerShown: false, animationEnabled: false }}
        />
        <Stack.Screen 
          name="LibraryPage" 
          component={LibraryPage} 
          options={{ headerShown: false, animationEnabled: false }}
        />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})