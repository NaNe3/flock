import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from "@react-navigation/native";

import WeekActivityTracker from "./components/WeekActivityTracker";

import { getAttributeFromObjectInLocalStorage, getLocallyStoredVariable, getLogsFromToday, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage";
import { useTheme } from "../hooks/ThemeProvider";
import MapBlock from "./components/MapBlock"
import WeekMapBlock from "./components/WeekMapBlock"
import LandingDisplay from "./components/LandingDisplay";

export default function HomePage({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [goal, setGoal] = useState('')

  const [logs, setLogs] = useState([])
  const [planItems, setPlanItems] = useState([])
  const [currentPlanItem, setCurrentPlanItem] = useState(null)
  const [scrollingState, setScrollingState] = useState(false)

  const getGoalText = async () => {
    const goal = await getAttributeFromObjectInLocalStorage("userInformation", "goal")
    setGoal(goal)
  }

  const init = async () => {
    const currentPlan = JSON.parse(await getLocallyStoredVariable('user_plans'))[0]
    const planItems = JSON.parse(await getLocallyStoredVariable(`plan_${currentPlan.plan_id}_items`))
    const piIds = planItems.map(pi => pi.plan_item_id)
    setPlanItems(planItems)

    const logs = JSON.parse(await getLocallyStoredVariable('user_logs'))
    const logsOfPlanItems = logs.filter(log => log.plan_id === currentPlan.plan_id && piIds.includes(log.plan_item_id))
    const latestLog = logsOfPlanItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    if (latestLog === undefined) {
      // if no logs exist, then it is monday
      if (logsOfPlanItems.length === 0) {
        const firstPlanItem = planItems[0]
        setCurrentPlanItem(firstPlanItem)
      } else {
        // if logs exist, then it is sunday
        console.log("week study finished")
      }
    } else {
      const nextPlanItem = planItems.find(pi => pi.plan_item_id === latestLog.plan_item_id + 1)
      setCurrentPlanItem(nextPlanItem)
    }
  }

  useFocusEffect(
    useCallback(() => {
      init()
      getGoalText()
    }, [])
  )

  const props = {
    navigation,
    goal,
  }

  return (
    <View style={styles.container}>
      <WeekActivityTracker />
      <LandingDisplay
        {...props}
        currentPlanItem={currentPlanItem}
        scrollingState={scrollingState}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: '100%', backgroundColor: theme.secondaryBackground, marginTop: -280, }}
        contentContainerStyle={{ alignItems: 'center' }}
        onScrollBeginDrag={() => setScrollingState(true)}
        onScrollEndDrag={() => setScrollingState(false)}
        scrollEventThrottle={16}
      >
        <View style={styles.homeContent}>
          {currentPlanItem !== null && planItems.map((item, i) => {
            return (
              <MapBlock
                key={`map-block-${i}`}
                item={item}
                status={item.plan_item_id === currentPlanItem.plan_item_id ? 'active' : item.plan_item_id > currentPlanItem.plan_item_id ? 'locked': 'complete'}
                navigation={navigation}
              />
            )
          })}
          <WeekMapBlock navigation={navigation} />
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
    homeContent: {
      width: '100%',
      paddingHorizontal: 30,
      paddingBottom: 40,
    },
    // subHeader: {
    //   fontFamily: 'nunito-bold', 
    //   fontSize: 16, 
    //   color: theme.darkishGray,
    // },
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
  })
}