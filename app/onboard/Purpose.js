import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import BasicButton from '../components/BasicButton';
import { hapticError } from '../utils/haptics';

const TextBlock = ({ children, delay, handleAnimationComplete }) => {
  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: delay,
      useNativeDriver: true,
    }).start(() => {
      handleAnimationComplete()
    })
  }, [fadeAnim, delay])

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

export default function Purpose({ navigation }) {
  const [disabled, setDisabled] = useState(true)
  const [messagesRendered, setMessagesRendered] = useState(0)
  const messages = [
    'HEY! Nice to meet you! My name is Rue',
    'Well.. My name is actually "רוּחַ ru\'ahh" buuuuuuuut you can call me Rue for short!!!',
    'I am here to help YOU improve your scripture study and connect with your friends! Think of me as your guardian angel',
    'I will help you set goals, track your progress, and keep you accountable',
    'LETS GET STARTED!!! 🎉',
  ]

  const handleAnimationComplete = () => {
    setMessagesRendered(prev => {
      const newCount = prev + 1
      return newCount
    });
  }

  useEffect(() => {
    if (messagesRendered === messages.length) {
      setDisabled(false);
    }
  }, [messagesRendered])

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <Image 
          source={require('../../assets/duo.png')} 
          style={styles.rueIcon} 
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <EmptySpace size={80} />
          {
            messages.map((message, index) => (
              <TextBlock 
                key={index} 
                delay={index * 1500}
                handleAnimationComplete={handleAnimationComplete}
              >
                <Text style={styles.convoText}>
                  {message.includes('"') ? highlightText(message) : message}
                </Text>
              </TextBlock>
            ))
          }
          <EmptySpace size={130} />
        </ScrollView>
      </View>

      <BasicButton
        title="NEXT"
        onPress={() => navigation.navigate('Screen3')}
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
    color: '#FFBF00',
  },
});