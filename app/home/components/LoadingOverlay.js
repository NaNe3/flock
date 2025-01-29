import { BlurView } from "expo-blur";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { gen } from "../../utils/styling/colors";
import hexToRgba from "../../utils/hexToRgba";

export default function LoadingOverlay({ loading }) {
  return (
    <View style={styles.container} />
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: hexToRgba(gen.primaryBackground, 0.8),

    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'nunito-bold'
  }
})