import { Text, View, StyleSheet } from 'react-native';

import BasicButton from '../components/BasicButton';

export default function Welcome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.introduction}>🎉 Welcome to 🎉</Text>
      <Text style={styles.rue}>RUE</Text>
      <Text style={styles.description}>THE INNOVATIVE SOLUTION TO SCRIPTURE STUDY AND SPIRITUAL GROWTH</Text>
      <BasicButton
        title="NEXT"
        onPress={() => navigation.navigate('Screen2')}
        style={{ position: 'absolute', bottom: 60 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  introduction: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'nunito-bold',
    margin: 0,
    marginTop: 100,
  },
  description: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'nunito-regular',
    margin: 0,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  rue: {
    fontSize: 80,
    letterSpacing: 10,
    fontWeight: 'bold',
    fontFamily: 'nunito-regular',
    marginBottom: 50,

  }
})