import { TouchableOpacity } from 'react-native'
import { View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

export default function HoverButton({ navigation }) {
  return (
    <TouchableOpacity style={styles.hover}>
      <Icon name='times' size={35} color='#AAA' />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  hover: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 70,
    right: 20,
  }
})