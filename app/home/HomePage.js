import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

import BasicButton from "../components/BasicButton";
import WeakContentBox from "../components/WeakContentBox";
import StrongContentBox from "../components/StrongContentBox"
import InteractiveHeaderBar from "../components/InteractiveHeaderBar";

import { getAttributeFromObjectInLocalStorage } from "../utils/localStorage";
import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";

const LandingDisplay = ({ navigation, goal, plan }) => {
  const [planButtonState, setPlanButtonState] = useState({
    disabled: true
  })

  useEffect(() => {
    if (goal) {
      setPlanButtonState({
        text: `${goal} min`,
        icon: 'clock-o',
        disabled: false,
      })
    } else {
      setPlanButtonState({
        text: "Create plan",
        icon: 'calendar',
        disabled: false,
      })
    }
  }, [goal])

  return (
    <View style={styles.landingContainer}>
      {/* <Text style={styles.streakNumber}>0</Text>
      <Text style={styles.streakText}>DAY STREAK</Text> */}
      <Text style={[styles.streakText, { marginBottom: 20, marginTop: 30 }]}>PERSONAL STUDY</Text>
      <Image source={require('../../assets/duo-half.png')} style={{ width: 200, height: 120, marginBottom: -30 }} />

      <BasicButton
        title={planButtonState.text}
        icon={planButtonState.icon}
        onPress={() => {
          hapticSelect()
          navigation.navigate('CreatePlan')
          // navigation.navigate('Chapter', {
          //   book: "3 Nephi",
          //   chapter: 22,
          // })
        }}
        disabled={planButtonState.disabled}
        style={{ marginTop: 20 }}
      />
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
        style={{ width: '100%', backgroundColor: gen.lightestGray }}
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
              <View>
                <Text style={styles.friendName}>Luke Michaelis</Text>
                <Text style={styles.friendActivity}>active 3w</Text>
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
    backgroundColor: gen.lightestGray,
    alignItems: 'center',
  },
  landingContainer: {
    width: '100%',
    backgroundColor: '#fff',
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
    borderColor: gen.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.darkGray,
  },
  friendActivity: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: gen.gray,
  },
  scriptureBox: {
    backgroundColor: gen.lightOrange,
    borderRadius: 10,
  },
  scripture: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: gen.orange,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
})