import { useState } from 'react';
import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BasicButton from '../components/BasicButton';
import BasicTextInput from '../components/BasicTextInput';
import { upsertUserWithName } from '../utils/authenticate';

const getUserInformation = async (nameOfUser) => {
  const goalOfUser = await AsyncStorage.getItem('goal')
  const { id, name, created_at, goal } = await upsertUserWithName(nameOfUser, goalOfUser)

  await AsyncStorage.setItem('userId', id.toString())
  await AsyncStorage.setItem('name', name.toString())
  await AsyncStorage.setItem('goal', goal.toString())
  await AsyncStorage.setItem('created_at', created_at.toString())
  await AsyncStorage.setItem('alreadyLaunched', 'true')
}

export default function GetStarted({ navigation }) {
  const [name, setName] = useState('')
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.pageHeader}>SWEET!</Text>
        <Text style={styles.prompt}>ONE MORE STEP THEN WE CAN MOVE ON!</Text>
        <BasicTextInput
          placeholder="NAME"
          keyboardType="default"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <BasicButton
          title="LETS STUDY"
          onPress={async () => {
            await getUserInformation(name)
            navigation.navigate('AppNavigation')
          }}
          style={{ position: 'absolute', bottom: 60 }}
          disabled={name.length === 0}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 80,
  }, 
  pageHeader: {
    fontSize: 48,
    fontFamily: 'nunito-bold',
  },
  prompt: {
    marginTop: 40,
    margin: 20,
    fontSize: 20,
    fontFamily: 'nunito-bold',
  }
})