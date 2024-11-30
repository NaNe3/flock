import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { gen } from "../utils/styling/colors";
import Icon from 'react-native-vector-icons/FontAwesome6'
import BasicButton from "../components/BasicButton";

export default function DailyReadingSummary({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.exitButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Icon name="xmark" size={30} color={gen.actionText} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.subHeader}>TODAY'S READING</Text>
        <Text style={styles.header}>MORMON 8</Text>
      </View>

      {/* <View style={{ flex: 1, alignItems: 'center' }}>
        <Text>7 friends have not read today</Text>
        <Text>REMIND THEM</Text>
        <Text>There is this amount of activity recently!!!!</Text>
      </View> */}

      <BasicButton
        title="next"
        onPress={() => {
          navigation.navigate('Chapter', {
            work: 'Book of Mormon',
            book: 'Ether',
            chapter: 12,
            verses: [1, 41]
          })
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontFamily: 'nunito-bold', 
    fontSize: 40,
    marginVertical: 0,
    color: gen.primaryText
  },
  subHeader: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    marginTop: 40,
    color: gen.darkishGray
  }
})