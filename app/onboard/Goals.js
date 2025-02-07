import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import BasicButton from '../components/BasicButton';
import { hapticSelect } from '../utils/haptics';
import { constants } from '../utils/styling/colors';

export default function Goals({ setCurrentScreen, planData, setPlanData }) {
  const [goal, setGoal] = useState(null)
  const [disabled, setDisabled] = useState(true)
  
  const SelectionBox = ({ option, icon }) => {
    return (
      <TouchableOpacity
        onPress={async () => {
          hapticSelect()
          setGoal(option)
          setDisabled(false)
          setPlanData({ ...planData, goal: goal })
        }}
        activeOpacity={1}
      >
        <View 
          style={
            goal === option 
              ? [styles.selectionBox, styles.boxSelected]
              : styles.selectionBox
          }
        >
          <Text style={
            goal === option 
              ? [styles.optionText, styles.boxSelected]
              : styles.optionText
          }
          >{icon}{icon ? " " : ""}{option} MINUTES</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LET'S SET SOME GOALS!</Text>
      <ScrollView
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
        style={{ width: '100%' }}
      >
        <View style={styles.questionBox}>
          <Text style={styles.medium}>DAILY STUDY TIME: </Text>
          <SelectionBox icon="🚶" option="5" />
          <SelectionBox icon="🏃️" option="10" />
          <SelectionBox icon="🚴" option="20" />
          <SelectionBox icon="👑" option="30" />
        </View>
        <BasicButton
          title="NEXT"
          onPress={() => {
            setPlanData({ ...planData, goal: goal })
            setCurrentScreen(prev => prev + 1)
          }}
          style={{ position: 'absolute', bottom: 60 }}
          disabled={disabled}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 70,
    fontSize: 20,
    fontFamily: 'nunito-bold',
    marginBottom: 20,
  },
  questionBox: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 40,
  },
  selectionBox: {
    width: '100%',
    padding: 20,
    borderWidth: 3,
    borderColor: constants.lightGray,
    borderRadius: 10,
    marginBottom: 13,
  },
  boxSelected: {
    borderColor: constants.blue,
    color: constants.blue,
  },
  medium: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 16,
    color: constants.darkGray,
    fontFamily: 'nunito-bold',
  }
})