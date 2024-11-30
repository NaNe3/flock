import { StyleSheet, View } from "react-native";
import { gen } from "../utils/styling/colors";
import { useEffect } from "react";

export default function PlannedStudy({ navigation, route }) {
  const { work, book, chapter, verses } = route.params

  useEffect(() => {

  }, [])

  return (
    <View style={styles.container}>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: gen.primaryBackground,
    backgroundColor: gen.red,
    alignItems: 'center'
  }
})