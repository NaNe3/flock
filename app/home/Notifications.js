import { Text, View, StyleSheet, ScrollView } from 'react-native'

import SimpleHeader from '../components/SimpleHeader';

export default function Notifications({ navigation }) {

  return (
    <View style={styles.container}>
      <SimpleHeader navigation={navigation} title="Notifications" />
      <ScrollView style={styles.notificationContainer}>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  }
})
