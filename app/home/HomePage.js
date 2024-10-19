import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import BasicButton from "../components/BasicButton";
import WeakContentBox from "../components/WeakContentBox";
import StrongContentBox from "../components/StrongContentBox"
import { getLocallyStoredVariable } from "../utils/localStorage";
import { hapticSelect } from "../utils/haptics";
import { useEffect, useState } from "react";

const HomeHeaderBar = () => {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerContent}>
        <Text style={[styles.text, { color: "#616161" }]}>WEEK 1</Text>
        <Text style={[styles.text, { color: "#616161" }]}><Text style={{ color: "#05D5FA"}}>0</Text> GEMS</Text>
      </View>
    </View>
  );
}

const LandingDisplay = ({ navigation }) => {
  const [goal, setGoal] = useState('')

  const getGoalText = async () => {
    const goal = await getLocallyStoredVariable('goal')
    setGoal(goal)
  }
  useEffect(() => {
    getGoalText()
  }, [])

  return (
    <View style={styles.landingContainer}>
      <Text style={styles.streakNumber}>1</Text>
      <Text style={styles.streakText}>DAY STREAK</Text>
    
      <BasicButton
        title={`${goal} min`}
        icon="clock-o"
        onPress={() => {
          hapticSelect()
          navigation.navigate('Chapter', {
            book: "3 Nephi",
            chapter: 22,
          })
        }}
        style={{ marginTop: 20 }}
      />
    </View>
  )
}

export default function HomePage({ navigation }) {

  return (
    <View style={styles.container}>
      <HomeHeaderBar />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <LandingDisplay navigation={navigation} />
        <View style={styles.homeContent}>
          <WeakContentBox title="DAILY CHALLENGES" />
          <StrongContentBox title="STUDY GROUPS" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  headerBar: {
    width: '100%',
    height: 110,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  headerContent: {
    display: "flex",
    height: 60,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landingContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingBottom: 30,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'nunito-bold',
  },
  streakNumber: {
    fontSize: 90,
    color: '#616161',
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  streakText: {
    fontSize: 18,
    color: '#616161',
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  homeContent: {
    width: '85%',
    paddingVertical: 40,
  }
})