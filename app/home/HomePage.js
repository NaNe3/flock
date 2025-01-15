import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from "@react-navigation/native";

import BasicButton from "../components/BasicButton";
import FA6Icon from "../components/FA6Icon"
import NotificationIndicator from "../components/NotificationIndicator";
import WeekActivityTracker from "./components/WeekActivityTracker";

import { getAttributeFromObjectInLocalStorage, getLocallyStoredVariable } from "../utils/localStorage";
import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getCurrentWeekNumber, getWeekFromTimestamp } from "../utils/plan";
import { useRealtime } from "../hooks/RealtimeProvider";
import { getColorLight, getPrimaryColor } from "../utils/getColorVariety";

const LandingDisplay = ({ navigation, goal, plan }) => {
  // const [userPlan, setUserPlan] = useState(null)
  const [versesInStudy, setVersesInStudy] = useState(0)
  const [chapter, setChapter] = useState('')
  const [location, setLocation] = useState({})
  const [primaryColor, setPrimaryColor] = useState('')
  const [primaryColorLight, setPrimaryColorLight] = useState('')
  const [time, setTime] = useState('')
  const [planButtonState, setPlanButtonState] = useState({
    disabled: false
  })
  const [hasStudied, setHasStudied] = useState(false)

  const init = async () => {
    const primaryColor = await getPrimaryColor()
    setPrimaryColor(primaryColor)
    setPrimaryColorLight(getColorLight(primaryColor))

    const week = getCurrentWeekNumber()
    const currentDay = new Date().getDay()
    // TODO - change plan async storage to be more specific
    const plan = JSON.parse(await getLocallyStoredVariable('Come Follow Me'))
    const weekPlan = plan.plan_info.weeks[week]
    const today = weekPlan.content[currentDay]
    const versesStringForToday = today.location.verses
    const versesForToday = versesStringForToday.split('-').map(verse => parseInt(verse))
    setVersesInStudy(versesForToday)

    // setUserPlan(weekPlan)
    setLocation(today.location)
    const chapter = `${today.location.book.replace("Joseph Smith", "JS").replace("Doctrine And Covenants", "D&C").toUpperCase()} ${today.location.chapter}`
    setChapter(chapter)
    setTime(today.time)

    await getStudyCompletion(week, currentDay)
  }

  const getStudyCompletion = async (week, currentDay) => {
    const logs = JSON.parse(await getLocallyStoredVariable('user_logs'))

    const year = new Date().getFullYear()
    const hasStudiedToday = logs.some(log => {
      const time = log.created_at

      const date = new Date(time)
      const yearOfLog = date.getFullYear()
      const weekOfLog = getWeekFromTimestamp(time)
      const dayOfLog = date.getDay()

      return yearOfLog === year && weekOfLog === week && dayOfLog === currentDay
    })
    setHasStudied(hasStudiedToday)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  return (
    <View style={styles.landingContainer}>
      <WeekActivityTracker />
      <View style={{ marginTop: 40, flex: 1, alignItems: 'center' }}>
        {
          hasStudied ? (
            <View style={[styles.subHeaderContainer, { backgroundColor: primaryColorLight }]}>
              <Text style={[styles.subHeader, { color: primaryColor }]}>
                study complete <FA6Icon name="check" size={13} color={primaryColor} />
              </Text>
            </View>
          ) : (
            <Text style={styles.subHeader}>START READING</Text>
          )
        }
        <Text style={[styles.header, chapter.length < 10 && { fontSize: 60}]}>{chapter}</Text>
      </View>
      <View style={styles.actionContainer}>
        <BasicButton
          title={hasStudied ? `go to chapter` : `${time} minutes`}
          icon={!hasStudied && 'clock-o'}
          onPress={() => {
            hapticSelect()
            navigation.navigate('Chapter', {
              work: location.work,
              book: location.book,
              chapter: location.chapter,
              plan: {
                verses: versesInStudy,
                next: null
              }
            })
          }}
          disabled={planButtonState.disabled}
          style={{ width: '100%' }}
        />

      </View>
    </View>
  )
}

export default function HomePage({ navigation }) {
  const { incoming } = useRealtime()
  const [goal, setGoal] = useState('')
  const [plan, setPlan] = useState('')

  // const [friends, setFriends] = useState([])
  const [friendCount, setFriendCount] = useState(0)
  const [requestCount, setRequestCount] = useState(0)

  const getGoalText = async () => {
    const [goal, plan] = await getAttributeFromObjectInLocalStorage("userInformation", ["goal", "plan"])
    setGoal(goal)
    setPlan(plan)
  }

  const init = async () => {
    //getFriends
    const friends = JSON.parse(await getLocallyStoredVariable('user_friends')).filter(friend => friend.status === 'accepted')
    // setFriends(friends)
    setFriendCount(friends.length)

    const friendRequests = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    setRequestCount(friendRequests.length)
  }

  useFocusEffect(
    useCallback(() => {
      init()
      getGoalText()
    }, [])
  )

  useEffect(() => {
    const trigger = async () => { await init() }
    if (incoming !== null) { trigger() }
  }, [incoming])

  const props = {
    navigation,
    goal,
    plan,
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={{ width: '100%', backgroundColor: gen.secondaryBackground }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <LandingDisplay {...props} />
        <View style={styles.homeContent}>
          <TouchableOpacity 
            style={styles.addFriendsButton}
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.navigate('AddFriend')
            }}
          >
            { requestCount > 0 && <NotificationIndicator count={requestCount} offset={-5} /> }
            <Text style={styles.buttonText}> 
              <Icon name="users" size={16} color={gen.actionText} /> {friendCount > 0 ? `${friendCount} friend${friendCount === 1 ? '' : 's'}` : 'find friends'}
            </Text>
          </TouchableOpacity>
          {/* <StrongContentBox 
            navigation={navigation}
            title="ACTIVITY"
            icon="user-plus"
          >
            <View style={styles.friendBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                  <Text style={styles.friendName}>Luke Michaelis</Text>
                  <Text style={styles.friendActivity}>active 3w</Text>
                </View>
              </View>
              <View style={styles.scriptureBox}>
                <Text style={styles.scripture}>3 NEPHI 27</Text>
              </View>
            </View>
          </StrongContentBox> */}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: gen.secondaryBackground,
    alignItems: 'center',
  },
  landingContainer: {
    width: '100%',
    backgroundColor: gen.primaryBackground,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 600,
    marginTop: -600,
  },
  homeContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50
  },
  header: {
    fontFamily: 'nunito-bold', 
    fontSize: 40, 
    marginVertical: 0,
    color: gen.primaryText,
    textAlign: 'center'
  },
  subHeaderContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  subHeader: {
    fontFamily: 'nunito-bold', 
    fontSize: 16, 
    color: gen.darkishGray,
  },
  addFriendsButton: {
    width: 180,
    paddingVertical: 10,
    borderColor: gen.primaryBorder,
    backgroundColor: gen.primaryBackground,
    borderRadius: 40,
    alignSelf: 'center',
  },
  buttonText: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.actionText,
    textAlign: 'center',
  }
})