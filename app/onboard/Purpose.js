import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import BasicButton from '../components/BasicButton';
import { hapticError, hapticSelect } from '../utils/haptics';
import { gen } from '../utils/styling/colors';

const TextBlock = ({ children }) => {
  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  return (
    <Animated.View style={{ ...styles.textBlock, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

const highlightText = (text) => {
  const parts = text.split('"')
  return (
    <Text>
      {parts[0]}
      <Text style={styles.textHighlight}>"{parts[1]}"</Text>
      {parts[2]}
    </Text>
  )
}

const EmptySpace = ({ size }) => <View style={{ height: size }} />

export default function Purpose({ setCurrentScreen }) {
  const messages = [
    'HEY! Nice to meet you! My name is Rue',
    'Well.. My name is actually "רוּחַ ru\'ahh" \n\nbuuuuuuuut you can call me Rue for short!!!',
    'I am here to help YOU improve your scripture study and connect with your friends! \n\nThink of me as your guardian angel',
    'I will help you set goals, track your progress, and keep you accountable',
    'LETS GET STARTED!!! 🎉',
  ]
  const [disabled, setDisabled] = useState(true)
  const [messagesRendered, setMessagesRendered] = useState([messages[0]])
  const scrollViewRef = useRef(null)

  const handleAnimationComplete = () => {
    if (messagesRendered.length === messages.length - 1) {
      setDisabled(false)
    }

    setMessagesRendered(prev => {
      return [...prev, messages[prev.length]]
    })
  }

  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (messagesRendered.length < messages.length) {
        handleAnimationComplete()
      } else {
        clearInterval(messageInterval)
      }
    }, 1500)

    return () => {
      clearInterval(messageInterval)
    }
  }, [messagesRendered])

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messagesRendered]);

  return (
    <View style={styles.container}>
      <GestureDetector 
        gesture={
          Gesture.Tap().onEnd(() => {
            if (messagesRendered.length < messages.length) {
              hapticSelect()
              handleAnimationComplete()
            } else if (disabled) {
              setDisabled(false)
            }
          })
        }
      >
        <View style={styles.scrollContainer}>
          <Image 
            source={require('../../assets/duo.png')} 
            style={styles.rueIcon} 
          />
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
          >
            <EmptySpace size={80} />
            {
              messagesRendered.map((message, index) => (
                <TextBlock key={index}>
                  <Text style={styles.convoText}>
                    {message && message.includes('"') ? highlightText(message) : message}
                  </Text>
                </TextBlock>
              ))
            }
            <EmptySpace size={230} />
          </ScrollView>
        </View>
      </GestureDetector>

      <BasicButton
        title="NEXT"
        onPress={() => setCurrentScreen(prev => prev + 1)}
        style={{ position: 'absolute', bottom: 60 }}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  rueIcon: {
    // THIS IS THE SAME AS THE FIRST EMPTYSPACE SIZE
    marginTop: 85,
    marginRight: 20,
    width: 40,
    height: 40,
  },
  textBlock: {
    marginBottom: 20,
    padding: 20,
    display: 'inline',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  convoText: {
    fontFamily: 'nunito-regular',
    fontSize: 16,
    marginBottom: 10,
  },
  textHighlight: {
    color: gen.primaryColor,
  },
});