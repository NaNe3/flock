import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from "@react-navigation/native";

import BasicButton from "../components/BasicButton";
import FA6Icon from "../components/FA6Icon"
import NotificationIndicator from "../components/NotificationIndicator";
import WeekActivityTracker from "./components/WeekActivityTracker";

import { getAttributeFromObjectInLocalStorage, getLocallyStoredVariable, getLogsFromToday, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage";
import { hapticImpactSoft, hapticSelect } from "../utils/haptics";
import { getCurrentWeekNumber, getWeekFromTimestamp } from "../utils/plan";
import { useRealtime } from "../hooks/RealtimeProvider";
import { getColorLight, getPrimaryColor } from "../utils/getColorVariety";
import { useTheme } from "../hooks/ThemeProvider";
import { getGroupsForUser } from "../utils/db-relationship";
import MapBlock from "./components/MapBlock";

const LandingDisplay = ({ navigation }) => {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [versesInStudy, setVersesInStudy] = useState(0)
  const [chapter, setChapter] = useState('')
  const [location, setLocation] = useState({})
  const [plan, setPlan] = useState({ plan_info: {}, plan_item_id: null, })
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
    
    console.log("week: ", week, " day: ", currentDay)
    const currentPlan = JSON.parse(await getLocallyStoredVariable('user_plans'))[0]
    const planItems = JSON.parse(await getLocallyStoredVariable(`plan_${currentPlan.plan_id}_items`))
    const currentPlanItem = planItems.find(item => item.week === week && item.day === currentDay)
    const chapter = currentPlanItem.book === "" || currentPlanItem.book === null
      ? `${currentPlanItem.work.replace("Doctrine And Covenants", "D&C").toUpperCase()} ${currentPlanItem.chapter}`
      : `${currentPlanItem.book.replace("Joseph Smith", "JS").replace("Doctrine And Covenants", "D&C").toUpperCase()} ${currentPlanItem.chapter}`
    setPlan({ plan_info: currentPlan, plan_item_id: currentPlanItem.plan_item_id })
    setChapter(chapter)
    setVersesInStudy(currentPlanItem.verses.split('-').map(verse => parseInt(verse)))
    setTime(currentPlanItem.time)
    setLocation({
      work: currentPlanItem.work,
      book: currentPlanItem.work === "Doctrine And Covenants" ? "Doctrine And Covenants" : currentPlanItem.book,
      chapter: currentPlanItem.chapter,
    })
  }

  // const getStudyCompletion = async (week, currentDay) => {
  //   const logs = JSON.parse(await getLocallyStoredVariable('user_logs'))

  //   const year = new Date().getFullYear()
  //   const hasStudiedToday = logs.some(log => {
  //     const time = log.created_at

  //     const date = new Date(time)
  //     const yearOfLog = date.getFullYear()
  //     const weekOfLog = getWeekFromTimestamp(time)
  //     const dayOfLog = date.getDay()

  //     return yearOfLog === year && weekOfLog === week && dayOfLog === currentDay && log.plan_item_id === plan.plan_item_id
  //   })
  //   setHasStudied(hasStudiedToday)
  // }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  return (
    <View style={styles.landingContainer}>
      <View style={styles.landingContentContainer}>
        <TouchableOpacity
          style={styles.planContainer}
          activeOpacity={0.7}
          onPress={() => {
            hapticSelect()
          }}
        >
          <View style={styles.planContentContainer}>
            <View style={styles.planBox}>
              <Text style={styles.planArt}>Come</Text>
              <Text style={styles.planArt}>Follow</Text>
              <Text style={styles.planArt}>Me</Text>
            </View>
            <Text style={styles.planText}>
              Come Follow Me &nbsp;<Icon name="chevron-down" size={12} color={theme.actionText} />
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.header, chapter.length < 10 && { fontSize: 60}]}>{chapter}</Text>
        <Text style={styles.verses}>verses {versesInStudy[0]} - {versesInStudy[1]}</Text>
      </View>
      <View style={styles.actionContainer}>
        <BasicButton
          title={`${time} minutes`}
          icon='clock-o'
          onPress={() => {
            hapticImpactSoft()
            navigation.navigate('Chapter', {
              work: location.work,
              book: location.book,
              chapter: location.chapter,
              plan: {
                verses: versesInStudy,
                ...plan
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
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const { groupInvites } = useRealtime()
  const [goal, setGoal] = useState('')

  // const [friends, setFriends] = useState([])
  const [groupCount, setGroupCount] = useState(0)
  const [requestCount, setRequestCount] = useState(0)

  const getGoalText = async () => {
    const goal = await getAttributeFromObjectInLocalStorage("userInformation", "goal")
    setGoal(goal)
  }

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    const { data } = await getGroupsForUser(userId)
    await setLocallyStoredVariable('user_groups', JSON.stringify(data))
    const groupCount = data.filter(g => {
        const isGroupAccepted = g.members.some(m => m.id === userId && m.status === 'accepted')
        return isGroupAccepted
      }).length
    setGroupCount(groupCount)

    const invitationCount = data.filter(g => {
        const isGroupPending = g.members.some(m => m.id === userId && m.status === 'pending')
        return isGroupPending
      }).length

    setRequestCount(invitationCount)

    const result = await getLogsFromToday()
    console.log("result: ", result)
  }

  useFocusEffect(
    useCallback(() => {
      init()
      getGoalText()
    }, [])
  )

  useEffect(() => {
    const trigger = async () => { await init() }
    if (groupInvites !== null) trigger()
  }, [groupInvites])

  const props = {
    navigation,
    goal,
  }

  return (
    <View style={styles.container}>
      <WeekActivityTracker />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: '100%', backgroundColor: theme.secondaryBackground }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <LandingDisplay {...props} />
        <View style={styles.homeContent}>
          {/* <TouchableOpacity
            style={styles.addFriendsButton}
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.navigate('GroupPage')
            }}
          >
            { requestCount > 0 && <NotificationIndicator count={requestCount} offset={-5} /> }
            <Text style={styles.buttonText}> 
              <Icon name="users" size={16} color={theme.actionText} /> {groupCount > 0 ? `${groupCount} group${groupCount > 1 ? 's' : ''}` : 'create group'}
            </Text>
          </TouchableOpacity> */}
          <MapBlock navigation={navigation} />
          <MapBlock navigation={navigation} />
          <MapBlock navigation={navigation} />
          <MapBlock navigation={navigation} />
        </View>
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.secondaryBackground,
      alignItems: 'center',
    },
    landingContainer: {
      width: '100%',
      backgroundColor: theme.primaryBackground,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      paddingBottom: 30,
      paddingTop: 600,
      marginTop: -600,
    },
    landingContentContainer: {
      marginVertical: 30, 
      flex: 1, 
      alignItems: 'center' 
    },
    homeContent: {
      width: '100%',
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    actionContainer: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    header: {
      fontFamily: 'nunito-bold', 
      fontSize: 40, 
      marginVertical: 0,
      color: theme.primaryText,
      textAlign: 'center'
    },
    subHeaderContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    // subHeader: {
    //   fontFamily: 'nunito-bold', 
    //   fontSize: 16, 
    //   color: theme.darkishGray,
    // },
    verses: {
      fontFamily: 'nunito-bold', 
      fontSize: 26, 
      color: theme.darkishGray,
    },
    addFriendsButton: {
      width: 180,
      paddingVertical: 10,
      borderColor: theme.primaryBorder,
      backgroundColor: theme.primaryBackground,
      borderRadius: 40,
      alignSelf: 'center',
    },
    buttonText: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.actionText,
      textAlign: 'center',
    },
    planContainer: {
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRadius: 100,
      height: 41,

      borderWidth: 3,
      borderColor: theme.primaryBorder,
    },
    planContentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planText: {
      fontSize: 15,
      fontFamily: 'nunito-bold',
      color: theme.actionText,
    },
    planBox: {
      backgroundColor: theme.maroon,
      width: 25,
      height: 25,
      borderRadius: 100,
      marginRight: 5,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planArt: {
      color: theme.orange,
      fontSize: 5,
      fontFamily: 'nunito-bold',
      textAlign: 'center',
    }
  })
}