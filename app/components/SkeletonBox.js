import { StyleSheet, View } from "react-native"
import { gen } from "../utils/styling/colors"

export default function SkeletonBox({ style }) {
  return <View style={[style, styles.skeletonStyles]} />
}

const styles = StyleSheet.create({
  skeletonStyles: { 
    backgroundColor: gen.tertiaryBackground,
  }
})