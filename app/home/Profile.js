import { StyleSheet, View } from "react-native";
import { gen } from "../utils/styling/colors";

export default function Profile({ navigation }) {
  return (
    <View style={styles.container}>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.secondaryBackground,
  }
})