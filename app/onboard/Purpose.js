import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import BasicButton from '../components/BasicButton';
import { hapticError } from '../utils/haptics';

const TextBlock = ({ children, delay }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, delay]);

  return (
    <Animated.View style={{ ...styles.textBlock, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

const EmptySpace = ({ size }) => {
  return <View style={{ height: size }} />;
};

export default function Purpose({ navigation }) {
  const [disabled, setDisabled] = useState(true);
  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <EmptySpace size={80} />
          <TextBlock delay={0}>
            <Text style={styles.convoText}>HEY! Nice to meet you! My name is Rue</Text>
          </TextBlock>
          <TextBlock delay={1500}>
            <Text style={styles.convoText}>Well.. My name is actually <Text style={styles.textHighlight}>"רוּחַ ru'ahh"</Text> buuuuuuuut </Text>
            <Text style={styles.convoText}>you can call me Rue for short!!!</Text>
          </TextBlock>
          <TextBlock delay={3000}>
            <Text style={styles.convoText}>I am here to help YOU improve your scripture study and connect with your friends! Think of me as your guardian angel</Text>
          </TextBlock>
          <TextBlock delay={4500}>
            <Text style={styles.convoText}>I will help you set goals, track your progress, and keep you accountable</Text>
            <Text></Text>
            <Text style={styles.convoText}>LETS GET STARTED!!! 🎉</Text>
          </TextBlock>
          <EmptySpace size={130} />
        </ScrollView>
      </View>

      <BasicButton
        title="NEXT"
        onPress={() => navigation.navigate('Screen3')}
        style={{ position: 'absolute', bottom: 60 }}
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
    width: '90%',
  },
  textBlock: {
    width: '80%',
    marginBottom: 20,
    padding: 20,
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