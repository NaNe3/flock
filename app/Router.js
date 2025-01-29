import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { NavigationContainer, DarkTheme } from '@react-navigation/native'

import Home from "./home";
import Book from './home/Book';
import Capture from "./home/Capture";
import Chapter from './home/Chapter';
import Group from './home/group/Group';
import Chapters from './home/Chapters';
import AddFriend from './home/AddFriend';
import CreatePlan from './home/CreatePlan';
import StreakView from "./home/StreakView";
import CommentPage from "./home/CommentPage";
import CreateGroup from './home/CreateGroup';
import PremiumOffer from './home/PremiumOffer';
import ViewImpressions from "./home/ViewImpressions";
import AddPeopleToGroup from './home/AddPeopleToGroup';
import NotificationsPage from './home/NotificationsPage';
import DailyReadingSummary from "./home/DailyReadingSummary";
import ProfilePageRouter from './home/profile/ProfilePageRouter';
import GroupDetailsRouter from './home/group/GroupDetailsRouter';

import NavigationBar from "./components/NavigationBar";
import FadeInView from "./components/FadeInView";

import { getUserIdFromLocalStorage, setLocallyStoredVariable } from "./utils/localStorage"
import { getFriendRequestsByUserId, getGroupsForUser, getRelationships } from "./utils/db-relationship"
import { gen, currentTheme } from "./utils/styling/colors"
import { checkUserStreak, getLogsByUserId, getPlanByUserId, } from "./utils/authenticate"
import LoadingScreen from "./home/ LoadingScreen"
import { checkRequiredDailyNotifications } from "./utils/notify"
import { RealtimeProvider } from "./hooks/RealtimeProvider"
import { forPushFromBottom } from "./utils/interpolations/forPushFromBottom";

const Stack = createStackNavigator()

export default function Router() {
  const [currentRoute, setCurrentRoute] = useState('Home')
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const withoutBar = ['PremiumOffer', 'Group', 'CreateGroup', 'Chapter', 'Capture', 'DailyReadingSummary', 'Profile', 'GroupDetails', 'EditGroupInfo', 'GroupDetailsRouter', 'AllGroupMembers', 'ViewImpressions', 'ProfilePageRouter', 'CommentPage', 'StreakView']

  const [realtimeData, setRealtimeData] = useState({})

  const handleStateChange = (state) => {
    const routeName = state.routes[state.index].name
    if (routeName === 'Landing') {
      const indexRoute = state.routes[state.index].state.index
      const route = state.routes[state.index].state.routes[indexRoute].name
      setCurrentRoute(route)
    } else {
      setCurrentRoute(routeName)
    }
  }

  useEffect(() => {
    const getUserGroups = async (userId) => {
      const { data } = await getGroupsForUser(userId)
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))
      setProgress(prev => prev + 1)
    }
    const getUserPlan = async (userId) => {
      const { plan } = await getPlanByUserId(userId)
      await setLocallyStoredVariable(plan.plan_name, JSON.stringify(plan))
      setProgress(prev => prev + 1)
    }
    const getUserFriends = async (userId) => {
      const { data } = await getRelationships(userId)
      setRealtimeData(prev => ({ ...prev, friends: data }))
      await setLocallyStoredVariable('user_friends', JSON.stringify(data))
      setProgress(prev => prev + 1)
    }
    const getUserFriendRequests = async (userId) => {
      const { data } = await getFriendRequestsByUserId(userId)
      await setLocallyStoredVariable('user_friend_requests', JSON.stringify(data))
      setProgress(prev => prev + 1)
    }
    const getUserLogs = async (userId) => {
      const { data } = await getLogsByUserId(userId)
      await setLocallyStoredVariable('user_logs', JSON.stringify(data))
      await checkUserStreak(data)
      setProgress(prev => prev + 1)
    }
    const checkNotifications = async () => {
      await checkRequiredDailyNotifications()
      setProgress(prev => prev + 1)
    }

    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setRealtimeData(prev => ({ ...prev, userId }))

      await getUserPlan(userId)
      await getUserGroups(userId)
      await getUserFriends(userId)
      await getUserFriendRequests(userId)
      await getUserLogs(userId)
      await checkNotifications()
    }

    init()
  }, [])

  return loading ? (
    <LoadingScreen 
      progress={progress} 
      steps={6} 
      setLoading={setLoading}
    />
  ) : (
    <FadeInView
      time={1000}
      style={styles.container}
    >
      <NavigationContainer
        theme={currentTheme === 'dark' ? DarkTheme : undefined}
        onStateChange={handleStateChange}
      >
        <RealtimeProvider realtimeData={realtimeData}>
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
              component={NotificationsPage}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen
              name='ProfilePageRouter'
              component={ProfilePageRouter}
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
              name='AddFriend'
              component={AddFriend}
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
              name='GroupDetailsRouter'
              component={GroupDetailsRouter}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen
              name='PremiumOffer'
              component={PremiumOffer}
              options={{
                animationEnabled: true,
                ...TransitionPresets.ScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen
              name='Capture'
              component={Capture}
              options={{
                animationEnabled: true,
                ...TransitionPresets.ScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen
              name='ViewImpressions'
              component={ViewImpressions}
              options={{ 
                animationEnabled: true, gestureEnabled: false,
                ...TransitionPresets.ScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen 
              name='DailyReadingSummary' component={DailyReadingSummary} options={{ 
                animationEnabled: true,
                ...TransitionPresets.ScaleFromCenterAndroid
              }}
            />
            <Stack.Screen 
              name='StreakView' component={StreakView} options={{ 
                animationEnabled: true, 
                ...TransitionPresets.ScaleFromCenterAndroid
              }}
            />
            <Stack.Screen
              name='CommentPage' component={CommentPage} options={{
                animationEnabled: true,
                gestureEnabled: false,
                cardStyleInterpolator: forPushFromBottom
              }}
            />
          </Stack.Navigator>
          {!withoutBar.includes(currentRoute) && (
            <NavigationBar
              currentRoute={currentRoute}
              setCurrentRoute={setCurrentRoute}
            />
          )}
        </RealtimeProvider>
      </NavigationContainer>
    </FadeInView>
  )
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})