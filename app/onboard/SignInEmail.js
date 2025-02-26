import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6'

import { constants } from '../utils/styling/colors';
import BasicTextInput from '../components/BasicTextInput';
import { hapticSelect } from '../utils/haptics';
import OnboardButton from '../components/OnboardButton';
import { authenticateUserThroughEmail, createUserThroughEmail, initSession } from '../utils/authenticate';
import { setLocallyStoredVariable } from '../utils/localStorage';

export default function SignInEmail({ setSignInWithEmail, setCurrentScreen, setSession }) {
  const [state, setState] = useState("signup")
  const [disabled, setDisabled] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [fname, setFname] = useState("")
  const [lname, setLname] = useState("")

  useEffect(() => {
    if (state === "signin") {
      if (email.length > 0 && password.length > 0) {
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    } else if (state === "signup") {
      if (email.length > 0 && password.length > 0 && (password === confirmPassword)) {
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    } else if (state === "name") {
      if (fname.length > 0) {
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    }
  }, [state, email, password, confirmPassword, fname, lname])

  const signUpThroughEmail = async () => {
    const { error, data } = await createUserThroughEmail(email, password, fname, lname)
    
    if (!error) {
      const result = await initSession()
      setSession(result)

      await setLocallyStoredVariable('user_information', JSON.stringify(data))
      setCurrentScreen(prev => prev + 1)
    }

  }

  const signInThroughEmail = async () => {
    const result = await authenticateUserThroughEmail(email, password)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.returnArrow}
          activeOpacity={0.7}
          onPress={() => {
            hapticSelect()
            if (state !== "name") {
              setSignInWithEmail(false)
            } else {
              setState("signup")
            }
          }}
        >
          <Icon name='arrow-left' size={30} color='#fff' />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 40 }}>
          <Text style={styles.pageHeader}>{
            state === "signin" ? 'Sign In' : state === 'signup' ? 'Sign Up' : 'Sweet'
          }</Text>
          <Text style={styles.prompt}>{
            state === "signin" || state === "signup" 
              ? 'Continue to begin your scripture studying journey!' 
              : 'We just need a little more information'
          }</Text>
        </View>

        <View style={styles.authContainer}>
          {(state === "signup" || state === "signin") && (
            <>
              <BasicTextInput
                placeholder="Email"
                style={styles.customTextInput}
                value={email}
                onChangeText={setEmail}
              />
              <BasicTextInput
                placeholder="Password"
                style={styles.customTextInput}
                value={password}
                onChangeText={setPassword}
              />
              {state === "signup" && (
                <BasicTextInput
                  placeholder="Confirm Password"
                  style={styles.customTextInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                /> 
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  hapticSelect()
                  if (state === "signin") {
                    setState("signup")
                  } else {
                    setState("signin")
                  }
                }}
              >
                <Text style={styles.alternativeText}>{ state === "signin" ? 'create an account' : 'I already have an account'}</Text>
              </TouchableOpacity>
            </>
          )}
          {state === "name" && (
            <>
              <BasicTextInput
                placeholder="First Name"
                style={styles.customTextInput}
                value={fname}
                onChangeText={setFname}
              />
              <BasicTextInput
                placeholder="Last Name"
                style={styles.customTextInput}
                value={lname}
                onChangeText={setLname}
              />
            </>
          )}
          <OnboardButton
            title="next"
            color={constants.blue}
            onPress={async () => {
              if (state === "signup") {
                setState("name")
              } else if (state === "signin") {
                await signInThroughEmail()
              } else if (state === "name") {
                await signUpThroughEmail()
              }
            }}
            style={styles.nextButton}
            disabled={disabled}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.blue,
    alignItems: 'center',
    paddingTop: 80,
  },
  returnArrow: {
    position: 'absolute',
    top: 100,
    left: 40,
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
  },
  alternativeText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: constants.blue,
    textAlign: 'center',
    marginTop: 20,
  },
  customTextInput: {
    borderRadius: 20,
    paddingVertical: 17,
  },
  nextButton: {
    marginTop: 40,
    alignSelf: 'center',
    width: '100%',
  },
});