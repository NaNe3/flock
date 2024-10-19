import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

export default function StrongContentBox({ title }) {
  return (
    <View style={styles.container}>
      <View style={{ 
        borderBottomWidth: 2,
        borderColor: '#D3D3D3', 
      }}>
        <Text style={styles.containerTitle}>{title}</Text>
      </View>
      <View style={styles.groupRowContainer}>
        <TouchableOpacity 
          onPress={() => console.log("HGELLO")}
        >
          <Text style={styles.createGroupButton}><Icon name="pencil" size={18} color="#000" /> CREATE GROUP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: 30,
  }, 
  containerTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: '#616161',
    marginLeft: 15,
    marginVertical: 15,
  }, 
  groupRowContainer: {
    width: '100%',
    padding: 20,
  },
  createGroupButton: {
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    fontSize: 16,
  }
})