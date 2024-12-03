import { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native'

import Home from "./home";
import Book from './home/Book';
import Group from './home/Group';
import Capture from "./home/Capture";
import Profile from "./home/Profile";
import Chapter from './home/Chapter';
import Chapters from './home/Chapters';
import AddFriends from './home/AddFriends';
import CreatePlan from './home/CreatePlan';
import CreateGroup from './home/CreateGroup';
import PremiumOffer from './home/PremiumOffer';
import Notifications from './home/Notifications';
import AddPeopleToGroup from './home/AddPeopleToGroup';
import DailyReadingSummary from "./home/DailyReadingSummary";

import NavigationBar from "./components/NavigationBar";

import { getUserIdFromLocalStorage, setLocallyStoredVariable } from "./utils/localStorage";
import { getGroupsForUser } from "./utils/db-relationship";
import { StyleSheet, View } from "react-native";
import { gen } from "./utils/styling/colors";
import { getPlanByUserId } from "./utils/authenticate";

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
    const getUserGroups = async (userId) => {
      const { data } = await getGroupsForUser(userId)
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))
    }
    const getUserPlan = async (userId) => {
      // TODO - get user activity to see which days the user has studied!
      const { plan } = await getPlanByUserId(userId)
      await setLocallyStoredVariable(plan.plan_name, JSON.stringify(plan))
    }

    const getUserInformation = async () => {
      const userId = await getUserIdFromLocalStorage()
      getUserGroups(userId)
      getUserPlan(userId)
      // aditional locally stored information
    }

    getUserInformation()
  }, [])

  return (
    <View style={styles.container}>
      <NavigationContainer onStateChange={handleStateChange}>
        <Stack.Navigator 
          initialRouteName='Landing'
          screenOptions={{
            cardStyle: { backgroundColor: gen.primaryBackground },
            headerShown: false,
          }}
        >
          <Stack.Screen
            name='Landing'
            component={Home}
            options={{ animationEnabled: false }}
          />

          <Stack.Screen
            name='Book'
            component={Book}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='Chapters'
            component={Chapters}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='Chapter'
            component={Chapter}
            options={{ animationEnabled: true, gestureEnabled: false }}
          />
          <Stack.Screen
            name='Notifications'
            component={Notifications}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name='Profile'
            component={Profile}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='CreatePlan'
            component={CreatePlan}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='CreateGroup'
            component={CreateGroup}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='AddPeopleToGroup'
            component={AddPeopleToGroup}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name='Group'
            component={Group}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name='AddFriends'
            component={AddFriends}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen 
            name='PremiumOffer'
            component={PremiumOffer}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen 
            name='Capture'
            component={Capture}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen 
            name='DailyReadingSummary'
            component={DailyReadingSummary}
            options={{ animationEnabled: true }}
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