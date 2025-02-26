import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'

import * as AppleAuthentication from 'expo-apple-authentication';

import { signInUserThroughAppleAuthentication } from './utils/authenticate';
import { finishOnboarding, setLocallyStoredVariable } from './utils/localStorage';
import { constants } from './utils/styling/colors';
import { hapticError, hapticImpactSoft, hapticSelect } from './utils/haptics';
import SignInEmail from './onboard/SignInEmail';

export default function SignIn({ setSession, setIsOnboardComplete, ...props }) {
  const { setCurrentScreen } = props
  const [name, setName] = useState('')
  const [platform] = useState(Platform.OS)

  const [signInWithEmail, setSignInWithEmail] = useState(false)

  const logInThroughExistingAppleAccount = async (credential) => {
    // 1 - authenticate user, this will access an account or create one
    const { data, next, error } = await signInUserThroughAppleAuthentication(credential)
    if (error) {
      console.error(error)
      return
    }

    await setLocallyStoredVariable('user_information', JSON.stringify(data))
    // two requirements to see the user home screen: session and onboarding_complete
    setSession(data)
    if (next !== 'onboard') {
      // set the onboarding_complete local variable to true
      await finishOnboarding()
      setIsOnboardComplete(true)
    } else {
      // continue with onboarding
      setCurrentScreen(prev => prev + 1)
    }
  }

  const authenticateUserThroughApple = async () => {
    hapticImpactSoft()
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      
      if (credential.identityToken) {
        await logInThroughExistingAppleAccount(credential)
      } else {
        throw new Error('No identityToken.')
      }
    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        console.log('Error with Apple sign-in')
        console.log(e)
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {signInWithEmail ? (
        <SignInEmail setSignInWithEmail={setSignInWithEmail} setSession={setSession} setCurrentScreen={setCurrentScreen}  />
      ) : (
        <View style={styles.container}>
          <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 40 }}>
            <Text style={styles.pageHeader}>Welcome</Text>
            <Text style={styles.prompt}>Continue to begin your scripture studying journey!</Text>
          </View>

          <View style={styles.authContainer}>
            <TouchableOpacity
              style={[styles.authButton, styles.accessButton, platform !== "ios" && { opacity: 0.4 }]}
              activeOpacity={platform === "ios" ? 0.7 : 0.4}
              onPress={() => {
                if (platform === "ios") {
                  authenticateUserThroughApple()
                } else {
                  hapticError()
                }
              }}
            >
              <Text style={styles.authText}>
                <Icon name='apple' size={20} color={constants.darkGray} /> Continue with Apple
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[styles.authButton, styles.accessButton]}
              onPress={() => hapticError()}
              activeOpacity={0.7}
            >
              <Text style={styles.authText}>
                <Icon name='google' size={16} color={constants.darkGray} /> Continue with Google
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[styles.authButton, styles.accessButton]}
              onPress={() => {
                hapticSelect()
                setSignInWithEmail(true)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.authText}>
                <Icon name='envelope' size={16} color={constants.darkGray} /> Continue with Email
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.blue,
    alignItems: 'center',
    paddingTop: 80,
  }, 
  pageHeader: {
    fontSize: 48,
    fontFamily: 'nunito-bold',
    color: '#fff',
  },
  prompt: {
    marginTop: 40,
    color: '#fff',
    fontSize: 20,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  authContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 80,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  authButton: {
    width: '100%',
    height: 60,
  },
  accessButton: {
    marginTop: 12, 
    backgroundColor: '#FFF',
    borderRadius: 20,
    color: '#fff',
    borderWidth: 3,
    borderColor: constants.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: constants.darkGray,
  }
})