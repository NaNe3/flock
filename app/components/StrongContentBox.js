import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { gen } from '../utils/styling/colors'

export default function StrongContentBox({ 
  navigation, 
  title, 
  icon, 
  onPress = null,
  children
}) {
  return (
    <View style={styles.container}>
      <View style={{ 
        borderBottomWidth: 2,
        borderColor: gen.primaryBorder, 
      }}>
        <Text style={styles.containerTitle}>{title}</Text>
      </View>
      <View style={styles.groupRowContainer}>
        {children}
        {
          onPress !== null && <TouchableOpacity 
            onPress={onPress}
            style={{
              padding: 15,
            }}
          >
            <Text style={styles.createGroupButton}><Icon name="plus" size={18} color={gen.actionText} /> ADD FRIENDS</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: gen.primaryBackground,
    borderRadius: 15,
    marginTop: 30,
  },
  containerTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: gen.actionText,
    marginLeft: 15,
    marginVertical: 15,
  }, 
  groupRowContainer: {
    width: '100%',
  },
  createGroupButton: {
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: gen.primaryText,
    fontSize: 16,
  }
})