import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { finishOnboarding, getUserIdFromLocalStorage, setUserInformationInLocalStorage } from './utils/localStorage';

import { LinearGradient } from 'expo-linear-gradient';
import OnboardingProgressBar from './components/OnboardingProgressBar'
import OnboardButton from './components/OnboardButton';

import SignIn from './SignIn';
// import Welcome from './onboard/Welcome'
import Purpose from './onboard/Purpose'
import UserMotivation from './onboard/UserMotivation'
import Permissions from './onboard/Permissions'
// import Religion from './onboard/Religion'
import GetColor from './onboard/GetColor'
import GetPhoto from './onboard/GetPhoto'
// import GetPhone from './onboard/GetPhone'
// import GetStarted from './onboard/GetStarted'
// import Friends from './onboard/Friends'

import { updateUserColorAfterAccountCreation } from './utils/authenticate';

export default function Onboard({ setSession, setIsOnboardComplete}) {
  const insets = useSafeAreaInsets()
  const [currentScreen, setCurrentScreen] = useState(1)
  const [disabled, setDisabled] = useState(true)
  const [onboardingData, setOnboardingData] = useState({
    purpose: null,
    religion: null,
    goals: null,
    color: {
      color_id: 1,
      color_hex: '#0ba3ff'
    },
    plan: null,
  })

  const props = {
    setCurrentScreen,
    onboardingData,
    setOnboardingData,
    setDisabled,
  }

  const screens = [
    // <Welcome {...props} />,
    <SignIn {...props} setSession={setSession} setIsOnboardComplete={setIsOnboardComplete} />,
    <Purpose {...props} />,
    <UserMotivation {...props} />,

    <Permissions {...props} />,

    // <GetPhone {...props} />,
    // <GetStarted {...props} setSession={setSession} setIsFirstLaunch={setIsFirstLaunch} />,
    <GetColor {...props} />,
    <GetPhoto {...props} />,
    // <Friends {...props} />,
  ]

  useEffect(() => {
    const setOnboardingData = async () => {
      const userId = await getUserIdFromLocalStorage()

      await finishOnboarding()
      const { data } = await updateUserColorAfterAccountCreation(onboardingData.color.color_id, userId)
      await setUserInformationInLocalStorage(data)

      setIsOnboardComplete(true)
    }

    if (currentScreen === screens.length + 1) {
      setOnboardingData()
    }
  }, [currentScreen])

  return (
    <View style={styles.container}>
          {currentScreen > 1 && (
            <OnboardingProgressBar 
              setCurrentScreen={setCurrentScreen}
              currentScreen={currentScreen}
              totalScreens={screens.length}
            />
          )}
          { screens[currentScreen - 1] }
          {currentScreen > 1 && currentScreen !== screens.length && (
            <View style={styles.bottomContainer}>
              <LinearGradient 
                colors={[ 'rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.90)', 'rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', ]}
                style={[styles.gradientBottom, { height: insets.bottom + 100 }]}
              />
              <OnboardButton
                title="next"
                color={onboardingData.color.color_hex}
                onPress={() => setCurrentScreen(prev => prev + 1)}
                style={[styles.nextButton, { marginBottom: insets.bottom + 15 }]}
                disabled={disabled}
              />
            </View>
          )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  nextButton: {
    alignSelf: 'center',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
  }
})