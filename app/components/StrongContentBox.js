import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

export default function StrongContentBox({ navigation, title, icon, children }) {
  return (
    <View style={styles.container}>
      <View style={{ 
        borderBottomWidth: 2,
        borderColor: '#D3D3D3', 
      }}>
        <Text style={styles.containerTitle}>{title}</Text>
      </View>
      <View style={styles.groupRowContainer}>
        {children}
        <TouchableOpacity 
          onPress={() => navigation.navigate("AddFriends")}
          style={{
            padding: 15,
          }}
        >
          <Text style={styles.createGroupButton}><Icon name="plus" size={18} color="#000" /> ADD FRIENDS</Text>
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
  },
  createGroupButton: {
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    fontSize: 16,
  }
})