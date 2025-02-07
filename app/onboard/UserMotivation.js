import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import BasicButton from '../components/BasicButton';
import { hapticSelect } from '../utils/haptics';
import EmptySpace from '../components/EmptySpace';
import { constants } from '../utils/styling/colors';

// SELECT MULTIPLE OPTIONS!!!

export default function UserMotivation({ onboardingData, setOnboardingData, setDisabled }) {
  const [goal, setGoal] = useState(null)
  const [motivation, setMotivation] = useState([])
  const [selectedColors, setSelectedColors] = useState({ color: '#0ba3ff', borderColor: '#0ba3ff' })

  useEffect(() => {
    setSelectedColors({
      color: onboardingData.color.color_hex,
      borderColor: onboardingData.color.color_hex,
    })

    if (onboardingData.motifs) {
      if (onboardingData.motifs.length === 0) {
        setDisabled(true)
      } else {
        setDisabled(false)
        setMotivation(onboardingData.motifs)
      }
    } else {
      setDisabled(true)
    }
  }, [])

  useEffect(() => {
    if (motivation.length > 0) {
      setDisabled(false)
      setOnboardingData({ ...onboardingData, motifs: motivation })
    } else {
      setDisabled(true)
    }
  }, [motivation])

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
          style={[styles.selectionBox, motivation.includes(option) && selectedColors]}
        >
          <Text style={styles.emoji}>{icon}</Text>
          <Text style={[styles.optionText, motivation.includes(option) && selectedColors]}>{prompt}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1, width: '100%', }}
        contentContainerStyle={{ alignItems: 'center' }}
        showsVerticalScrollIndicator={false} 
      >
        <Text style={styles.header}>Why do you want to study with us?</Text>
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
    fontSize: 20,
    fontFamily: 'nunito-bold',
    marginHorizontal: 40,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    color: constants.darkGray,
  },
  emoji: { 
    width: 40
  }
})