import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import BasicButton from '../components/BasicButton';
import { hapticSelect } from '../utils/haptics';
import EmptySpace from '../components/EmptySpace';
import { gen } from '../utils/styling/colors';

// SELECT MULTIPLE OPTIONS!!!

export default function UserMotivation({ setCurrentScreen, onboardingData, setOnboardingData }) {
  const [goal, setGoal] = useState(null)
  const [motivation, setMotivation] = useState([])
  const [disabled, setDisabled] = useState(true)

  const motivations = [
    {
      icon: "💛",
      option: "relationship",
      prompt: "Strengthen my relationship with God",
    },
    {
      icon: "🤼",
      option: "social",
      prompt: "Study with friends",
    },
    {
      icon: "🦉",
      option: "learn",
      prompt: "I want to know the Scriptures better",
    },
    {
      icon: "🌿",
      option: "journal",
      prompt: "Fancy study journal!",
    },
    {
      icon: "📖",
      option: "improvement",
      prompt: "My study habits need improvement",
    },
    {
      icon: "👀",
      option: "other",
      prompt: "Other :D",
    },
  ]

  const SelectionBox = ({ option, icon, prompt }) => {
    return (
      <TouchableOpacity
        onPress={async () => {
          hapticSelect()
          if (motivation.includes(option)) {
            setMotivation(motivation.filter(m => m !== option))
          } else {
            setMotivation([...motivation, option])
          }
          setDisabled(false)
        }}
        activeOpacity={1}
      >
        <View 
          style={[styles.selectionBox, motivation.includes(option) && styles.boxSelected]}
        >
          <Text style={styles.emoji}>{icon}</Text>
          <Text style={[styles.optionText, motivation.includes(option) && styles.boxSelected]}>{prompt}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>What are you doing here?</Text>
      <ScrollView
        style={{ flex: 1, width: '100%', }}
        contentContainerStyle={{ alignItems: 'center' }}
        showsVerticalScrollIndicator={false} 
      >
        <View style={styles.questionBox}>
          {
            motivations.map((motivation, index) => (
              <SelectionBox
                key={`select-${index}`}
                option={motivation.option}
                icon={motivation.icon}
                prompt={motivation.prompt}
              />
            ))
          }
        </View>
        <EmptySpace size={100} />
      </ScrollView>
      <BasicButton
        title="next"
        onPress={() => {
          setOnboardingData({ ...onboardingData, motivation })
          setCurrentScreen(prev => prev + 1)
        }}
        style={{ position: 'absolute', bottom: 60 }}
        disabled={disabled}
      />
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
    borderColor: gen.lightGray,
    borderRadius: 10,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxSelected: {
    borderColor: gen.orange,
    color: gen.orange,
  },
  medium: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    marginBottom: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'nunito-bold',
    flexWrap: 'wrap',
    color: gen.darkGray,
  },
  emoji: { 
    width: 40
  }
})