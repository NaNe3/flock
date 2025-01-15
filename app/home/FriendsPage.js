import { StyleSheet, View, Text } from "react-native"
import { gen } from "../utils/styling/colors"

import AddFriend from "./AddFriend"

export default function FriendsPage({ navigation }) {
  return (
    <View style={styles.container}>
      <AddFriend />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  }
})