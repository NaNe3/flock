import { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';

import BasicButton from '../components/BasicButton'
import BasicTextInput from '../components/BasicTextInput';

// TO DO LIST
// BUG: Gets stuck inside of the parenthesis
// BUG: Can't delete the last number

export default function GetPhone({ setCurrentScreen, onboardingData, setOnboardingData }) {
  const [disabled, setDisabled] = useState(true)
  const [phone, setPhone] = useState('')
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef])

  const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '').replace(/^1/, '')
    const sections = ['+1 ', '', '', '']
  
    if (cleaned.length >= 3) {
      sections[1] = `(${cleaned.slice(0, 3)}) `
    } else {
      sections[1] = cleaned
    }

    if (cleaned.length >= 6) {
      sections[2] = `${cleaned.slice(3, 6)} `
    } else if (cleaned.length >= 3 && cleaned.length <= 6) {
      sections[2] = `${cleaned.slice(3, cleaned.length)}`
    }

    if (cleaned.length > 6) {
      sections[3] = `${cleaned.slice(6, 10)}`
    }

    return sections.join("")
  }

  const handlePhoneChange = (text) => {
    // clean phone number
    let cleaned = ('' + text).replace(/\D/g, '').replace(/^1/, '')
    if (text[text.length - 1] === ' ' || text[text.length - 1] === ')') {
      cleaned = cleaned.slice(0, cleaned.length - 1)
    }
    if (cleaned.length === 11) {
      cleaned = cleaned.slice(0, 10)
    }
    
    // reformat new value
    const formattedPhone = formatPhoneNumber(cleaned)
    setPhone(formattedPhone)

    // set variables
    setDisabled(cleaned.length !== 10)
    setSelection({ start: formattedPhone.length, end: formattedPhone.length })
    if (cleaned.length === 10) Keyboard.dismiss()
    setOnboardingData(prev => ({ ...prev, phone: cleaned }))
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={styles.container}>
          <View style={styles.viewableContent}>
            <Text style={styles.optionText}>PHONE NUMBER</Text>
            <BasicTextInput
              ref={inputRef}
              placeholder={'+1 (555) 555 5555'}
              keyboardType={'phone-pad'}
              onChangeText={handlePhoneChange}
              value={phone}
              selection={selection}
              style={{ width: '90%' }}
            />
            <Text style={styles.infoText}>* Your friends will find you through your number</Text>
          </View>
        </View>
        <BasicButton
          title="next"
          onPress={() => {
            setCurrentScreen((prev) => prev + 1)
          }}
          style={styles.nextButton}
          disabled={disabled}
        />

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewableContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 70,
  },
  optionText: {
    fontSize: 20,
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#616161',
    fontFamily: 'nunito-bold',
  },
  infoText: {
    width: '80%',
    fontSize: 16,
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'left',
    color: '#AAA',
    fontFamily: 'nunito-regular',
  },
  nextButton: {
    marginBottom: 60,
  }

})