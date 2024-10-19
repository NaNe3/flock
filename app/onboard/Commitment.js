import { Text, View, StyleSheet } from 'react-native';
import BasicButton from '../components/BasicButton';

export default function Commitment({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.commitText}>ARE YOU COMMITED?</Text>
      <Text style={styles.subtleText}>ITS WORTH IT!</Text>
      <BasicButton
        title="I COMMIT"
        onPress={() => navigation.navigate('Screen5')}
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
    justifyContent: 'center',
  },
  commitText: {
    fontSize: 60,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    marginBottom: 50
  },
  subtleText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'nunito-regular',
    marginTop: 10,
    color: '#777',
  }
})