import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'
import * as AppleAuthentication from 'expo-apple-authentication';

import { createUserThroughAppleAuthentication } from '../utils/authenticate';
import { setUserInformationInLocalStorage } from '../utils/localStorage';
import { gen } from '../utils/styling/colors';

// TO DO 
// IMPORTANT
// 3. Check if user exists in database and if so, do not ask to invite friends or upload photo

// SECONDARY
// 1. Add Google Sign-in
// 2. Add Email Sign-in

const setUserData = async (props) => {
  await setUserInformationInLocalStorage({ ...props })
}

export default function GetStarted({ setCurrentScreen, setSession, onboardingData, setOnboardingData, setIsFirstLaunch }) {
  const [name, setName] = useState('')

  const authenticateUserThroughApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      // provider_id (credential) and user (from supabase) are the same
      // this will be important if you want to verify an account exists if it is not the first time a user is signing in through apple

      if (credential.identityToken) {
        setSession(credential)
        const { phone } = onboardingData
        const {
          id,
          uui,
          created_at,
          email,
          fname,
          lname,
          goal,
          phone_number,
          plan_id
        } = await createUserThroughAppleAuthentication(credential, phone)

        setOnboardingData(prev => ({ ...prev, phone: phone_number, id, fname, lname }))

        await setUserData({ id, uui, created_at, email, fname, lname, goal, phone_number, plan_id })
        setCurrentScreen(prev => prev + 1)
      } else { throw new Error('No identityToken.') }
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

  const alreadyHaveAccount = () => {
    setIsFirstLaunch(false)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 40 }}>
          <Text style={styles.pageHeader}>SWEET</Text>
          <Text style={styles.prompt}>lets create an account before moving on!</Text>
        </View>

        <View style={styles.authContainer}>
          {/* <AppleAuthentication.AppleAuthenticationButton 
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={10} 
            style={styles.authButton}
            onPress={() => authenticateUserThroughApple()}
          /> */}
          <TouchableOpacity
            style={[styles.authButton, styles.accessButton]}
            onPress={() => authenticateUserThroughApple()}
            activeOpacity={0.7}
          >
            <Text style={styles.authText}>
              <Icon name='apple' size={20} color={gen.darkGray} /> Continue with Apple
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authButton, styles.accessButton]}
            onPress={() => console.log("SIGNING INTO GOOGLE")}
            activeOpacity={0.7}
          >
            <Text style={styles.authText}>
              <Icon name='google' size={16} color={gen.darkGray} /> Continue with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={alreadyHaveAccount}
          >
            <Text style={styles.otherText}>
              already have an account <Icon name='arrow-right' size={12} color={gen.darkGray} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryColor,
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
    borderColor: gen.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: gen.darkGray,
  },
  otherText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: gen.darkGray,
    textAlign: 'center',
    marginTop: 20,
  }
})