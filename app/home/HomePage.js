import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BasicButton from "../components/BasicButton";
import StrongContentBox from "../components/StrongContentBox"
import WeekActivityTracker from "./components/WeekActivityTracker";

import { getAttributeFromObjectInLocalStorage, getLocallyStoredVariable } from "../utils/localStorage";
import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getCurrentWeekNumber } from "../utils/plan";

const LandingDisplay = ({ navigation, goal, plan }) => {
  const [userPlan, setUserPlan] = useState(null)
  const [chapter, setChapter] = useState('')  
  const [location, setLocation] = useState({})
  const [time, setTime] = useState('')
  const [planButtonState, setPlanButtonState] = useState({
    disabled: false
  })

  useEffect(() => {
    const init = async () => {
      const week = getCurrentWeekNumber()
      const currentDay = new Date().getDay()
      const plan = JSON.parse(await getLocallyStoredVariable('Come Follow Me'))
      const weekPlan = plan.plan_info.weeks[week]
      const today = weekPlan.content[currentDay]

      setUserPlan(weekPlan)
      setLocation(today.location)
      setChapter(`${today.location.book.toUpperCase()} ${today.location.chapter}`)
      setTime(today.time)
    }

    init()
  }, [])

  return (
    <View style={styles.landingContainer}>
      <WeekActivityTracker />
      <Text style={styles.subHeader}>START READING</Text>
      <Text style={styles.header}>{chapter}</Text>

      <View style={styles.actionContainer}>
        <BasicButton
          title={`${time} minutes`}
          icon={'clock-o'}
          onPress={() => {
            hapticSelect()
            navigation.navigate('DailyReadingSummary', {
              plan: userPlan,
              chapter: chapter,
              location: location,
              time: time,
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
  const [goal, setGoal] = useState('')
  const [plan, setPlan] = useState('')

  const getGoalText = async () => {
    const [goal, plan] = await getAttributeFromObjectInLocalStorage("userInformation", ["goal", "plan"])
    setGoal(goal)
    setPlan(plan)
  }

  useEffect(() => {
    getGoalText()
  }, [])

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
          {/* <WeakContentBox title="TO DO LIST" /> */}
          <StrongContentBox 
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
            <View style={styles.friendBox}>
              <View>
                <Text style={styles.friendName}>Justin Andrews</Text>
                <Text style={styles.friendActivity}>Studied Today</Text>
              </View>
              <View style={styles.scriptureBox}>
                <Text style={styles.scripture}>3 NEPHI 27</Text>
                <Text style={styles.scripture}>MATT 5</Text>
                <Text style={styles.scripture}>MATT 6</Text>
              </View>
            </View>
            <View style={styles.friendBox}>
              <View>
                <Text style={styles.friendName}>Justin Andrews</Text>
                <Text style={styles.friendActivity}>Studied Today</Text>
              </View>
              <View style={styles.scriptureBox}>
                <Text style={styles.scripture}>3 NEPHI 27</Text>
                <Text style={styles.scripture}>MATT 5</Text>
                <Text style={styles.scripture}>MATT 6</Text>
              </View>
            </View>
          </StrongContentBox>
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
  streakNumber: {
    fontSize: 90,
    color: gen.darkGray,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  streakText: {
    fontSize: 18,
    color: gen.darkGray,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  homeContent: {
    width: '85%',
    paddingVertical: 40,
  },
  friendBox: {
    width: '100%',
    padding: 20,
    borderBottomWidth: 2,
    borderColor: gen.primaryBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.actionText,
  },
  friendActivity: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: gen.gray,
  },
  scriptureBox: {
    backgroundColor: gen.primaryColorLight,
    borderRadius: 10,
  },
  scripture: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: gen.primaryColor,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50
  },
  actionPlanBox: {
    width: '100%', 
    marginBottom: -10, 
    marginTop: 40, 
    paddingTop: 10, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifySelf: 'center', 
    justifyContent: 'space-between',
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10, 
    borderWidth: 5, 
    borderColor: gen.primaryColor, 
  },
  book: {
    width: 40,
    height: 50,
    borderRadius: 5,
    backgroundColor: gen.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookName: {
    fontSize: 6,
    fontFamily: 'nunito-bold',
    color: gen.orange,
  },
  header: {
    fontFamily: 'nunito-bold', 
    fontSize: 40, 
    marginVertical: 0, 
    color: gen.primaryText
  },
  subHeader: {
    fontFamily: 'nunito-bold', 
    fontSize: 16, 
    marginTop: 40, 
    color: gen.darkishGray
  }
})