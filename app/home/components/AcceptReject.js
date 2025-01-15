import { TouchableOpacity, View } from "react-native"
import { StyleSheet, Text } from "react-native"

import { gen } from "../../utils/styling/colors"

export default function AcceptReject({ accept, reject }) {
  return (
    <View style={styles.inviteRow}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[styles.button, styles.acceptButton]}
        onPress={accept}
      >
        <Text style={styles.buttonText}>ACCEPT</Text>
      </TouchableOpacity>
      <View style={{ width: 10 }} />
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[styles.button, styles.rejectButton]}
        onPress={reject}
      >
        <Text style={styles.buttonText}>REJECT</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  inviteRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 10,
  },
  acceptButton: { backgroundColor: gen.primaryColor },
  rejectButton: { backgroundColor: gen.red },
  buttonText: {
    fontFamily: 'nunito-bold',
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
  },
})