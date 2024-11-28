import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { finishOnboarding } from './utils/localStorage';

import Welcome from './onboard/Welcome'
import Purpose from './onboard/Purpose'
import UserMotivation from './onboard/UserMotivation'
// import Religion from './onboard/Religion'
import GetPhoto from './onboard/GetPhoto';
import GetPhone from './onboard/GetPhone'
import GetStarted from './onboard/GetStarted'
import Friends from './onboard/Friends'

// TO DO
// 1. Check user authentication status. Find out how to authenticate without requiring user to login

export default function Onboard({ setIsOnboardComplete, setSession }) {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    purpose: null,
    religion: null,
    goals: null,
    plan: null,
    phone: null,
  })

  const props = {
    setCurrentScreen,
    onboardingData,
    setOnboardingData,
  }

  const screens = [
    <Welcome {...props} />,
    <Purpose {...props} />,
    <UserMotivation {...props} />,
    <GetPhone {...props} />,
    <GetStarted {...props} setSession={setSession} />,
    <GetPhoto {...props} />,
    <Friends {...props} />,
  ]

  useEffect(() => {
    const setOnboardingData = async () => {
      await finishOnboarding()
    }

    if (currentScreen === screens.length + 1) {
      setOnboardingData()
      setIsOnboardComplete(true)
    }
  }, [currentScreen])

  return (
    <View style={styles.container}>
      { screens[currentScreen - 1] }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  }
})