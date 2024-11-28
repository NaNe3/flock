import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { gen } from "../../utils/styling/colors"
import Icon from 'react-native-vector-icons/FontAwesome'

const Slider = ({ 
  navigation, 
  onPress = () => null,
  child = null 
}) => {
  return (
    <TouchableOpacity 
      style={styles.sliderContainer}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {child}
    </TouchableOpacity>
  )
}

export default function ExperienceSlider({ navigation, location }) {
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.containerStyle}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        <Slider 
          navigation={navigation} 
          child={<Icon name="plus" size={25} color={gen.gray} />}
          onPress={() => {
            console.log("GOIN GTO CAPTURE")
            navigation.navigate('Capture', location)
          }}
        />
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 160,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    width: 100,
    height: 140,
    marginLeft: 10,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: gen.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  }
})