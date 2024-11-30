import { StyleSheet, View, Text } from "react-native"
import { gen } from "../utils/styling/colors"

export default function PremiumOffer({ navigation }) {
  return (
    <View style={styles.container}>
      <Text
        onPress={() => navigation.goBack()}
      >Premium Offer</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: gen.primaryBackground,
  }
})