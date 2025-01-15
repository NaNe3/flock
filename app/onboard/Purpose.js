import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image, TouchableOpacity } from 'react-native';

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

const highlightText = (text, onboardingData) => {
  const parts = text.split('"')
  return (
    <Text>
      {parts[0]}
      <Text style={[styles.textHighlight, { color: onboardingData.color.color_hex }]}>{parts[1]}</Text>
      {parts[2]}
    </Text>
  )
}

const EmptySpace = ({ size }) => <View style={{ height: size }} />

export default function Purpose({ setDisabled, onboardingData }) {
  const messages = [
    'Welcome to "flock" 🐑: \n\nthe scripture study app that allows you to share your testimony and impressions with friends',
    'Sharing your testimony is the greatest way to strengthen it 💪',
    'In fact, President "Boyd K Packer" once said: \n\nA testimony is to be found in the bearing of it!',
    'When you share with others, you are doing as the Savior did 2,000 years ago!',
    'We hope you enjoy "flock" and find it a useful medium to deepen your conversion to Christ 👑',
  ]
  const [messagesRendered, setMessagesRendered] = useState([messages[0]])
  const scrollViewRef = useRef(null)

  const handleAnimationComplete = () => {
    if (messagesRendered.length === messages.length - 1) {
      setDisabled(false)
    }

    setMessagesRendered(prev => {
      return [...prev, messages[prev.length]]
    })
    setTimeout(() => {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }, 20)
  }

  useEffect(() => {
    setDisabled(true)
  }, [])

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
  }, [messagesRendered]);

  return (
    <View style={styles.scrollContainer}>
      <Image 
        source={require('../../assets/profile.jpg')} 
        style={styles.rueIcon} 
      />
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, paddingTop: 20 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (messagesRendered.length < messages.length) {
              hapticSelect()
              handleAnimationComplete()
            } else {
              setDisabled(false)
            }
          }}
          style={styles.scrollContent}
        >
          {
            messagesRendered.map((message, index) => (
              <TextBlock key={index}>
                <Text style={styles.convoText}>
                  {message && message.includes('"') ? highlightText(message, onboardingData) : message}
                </Text>
              </TextBlock>
            ))
          }
          <EmptySpace size={230} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 30,
  },
  scrollContent: {
    flex: 1,
    minHeight: '100%',
  },
  rueIcon: {
    marginTop: 20,
    marginRight: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
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