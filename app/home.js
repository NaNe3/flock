import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './home/HomePage'
import GroupPage from './home/GroupPage'
// import FriendsPage from './home/FriendsPage';
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
      <Stack.Navigator 
        initialRouteName='Home'
        screenOptions={{
          cardStyle: { backgroundColor: gen.primaryBackground },
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomePage}
        />
        <Stack.Screen
          name="GroupPage"
          component={GroupPage}
        />
        {/* <Stack.Screen
          name="FriendsPage"
          component={FriendsPage}
        /> */}
        <Stack.Screen
          name="LibraryPage" 
          component={LibraryPage} 
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