import { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'

import Home from "./home";
import Book from './home/Book';
import Chapters from './home/Chapters';
import Chapter from './home/Chapter';
import Notifications from './home/Notifications';
import CreatePlan from './home/CreatePlan';
import CreateGroup from './home/CreateGroup';
import Group from './home/Group';
import AddFriends from './home/AddFriends';
import PremiumOffer from './home/PremiumOffer';
import AddPeopleToGroup from './home/AddPeopleToGroup';
import Capture from "./home/Capture";
import Profile from "./home/Profile";

import NavigationBar from "./components/NavigationBar";

import { getUserIdFromLocalStorage, setLocallyStoredVariable } from "./utils/localStorage";
import { getGroupsForUser } from "./utils/db-relationship";
import { StyleSheet, View } from "react-native";
import { gen } from "./utils/styling/colors";
import DailyReadingSummary from "./home/DailyReadingSummary";

const Stack = createStackNavigator()

export default function Router() {
  const [currentRoute, setCurrentRoute] = useState('Home')
  const withoutBar = ['PremiumOffer', 'Group', 'CreateGroup', 'Chapter', 'Capture', 'DailyReadingSummary']

  const handleStateChange = (state) => {
    const routeName = state.routes[state.index].name
    if (routeName === 'Landing') {
      const indexRoute = state.routes[state.index].state.index
      setCurrentRoute(state.routes[state.index].state.routes[indexRoute].name)
    } else {
      setCurrentRoute(routeName)
    }
  }

  useEffect(() => {
    const getUserInformation = async () => {
      // GET USER GROUPS
      const userId = await getUserIdFromLocalStorage()
      const { data } = await getGroupsForUser(userId)

      // SET GROUPS IN LOCAL STORAGE
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))
    }

    getUserInformation()
  }, [])

  return (
    <View style={styles.container}>
      <NavigationContainer onStateChange={handleStateChange}>
        <Stack.Navigator initialRouteName='Landing'>
          <Stack.Screen
            name='Landing'
            component={Home}
            options={{ headerShown: false, animationEnabled: false }}
          />

          <Stack.Screen
            name='Book'
            component={Book}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='Chapters'
            component={Chapters}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='Chapter'
            component={Chapter}
            options={{ headerShown: false, animationEnabled: true, gestureEnabled: false }}
          />
          <Stack.Screen
            name='Notifications'
            component={Notifications}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen 
            name='Profile'
            component={Profile}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='CreatePlan'
            component={CreatePlan}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='CreateGroup'
            component={CreateGroup}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='AddPeopleToGroup'
            component={AddPeopleToGroup}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen 
            name='Group'
            component={Group}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen
            name='AddFriends'
            component={AddFriends}
            options={{ headerShown: false, animationEnabled: true }}
          />
          <Stack.Screen 
            name='PremiumOffer'
            component={PremiumOffer}
            options={{ headerShown: false, animationEnabled: false }}
          />
          <Stack.Screen 
            name='Capture'
            component={Capture}
            options={{ headerShown: false, animationEnabled: false }}
          />
          <Stack.Screen 
            name='DailyReadingSummary'
            component={DailyReadingSummary}
            options={{ headerShown: false, animationEnabled: false }}
          />
        </Stack.Navigator>
        {!withoutBar.includes(currentRoute) && (
          <NavigationBar 
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
          />
        )}
      </NavigationContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})