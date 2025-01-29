import { View } from "react-native";

export default function EmptySpace({ size, style={} }) {
  return <View style={[{ height: size, width: '100%' }, style]} />
}

// EMPTY SPACE
// WITH EACH SCROLLVIEW, THERE IS AN ADDITIONAL 150 PIXELS IN PADDING