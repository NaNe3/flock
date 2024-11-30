import { Text, View, StyleSheet, ScrollView } from 'react-native'

import SimpleHeader from '../components/SimpleHeader';
import { gen } from '../utils/styling/colors';

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
    backgroundColor: gen.secondaryBackground,
  },
  notificationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  }
})
