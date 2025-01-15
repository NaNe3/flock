import { StyleSheet, View } from "react-native";
import { gen } from "../utils/styling/colors";

export default function CommentBar({ navigation, route }) {
  return (
    <View style={styles.container}>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 45,
    backgroundColor: gen.primaryBackground,
    borderRadius: 20,
  }
})