import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'
import { hapticSelect } from "../utils/haptics";
import { useState } from "react";

export default function NavigationBar() {
  const navigation = useNavigation()
  const [currentRoute, setCurrentRoute] = useState('Home')

  const changePage = (route) => {
    hapticSelect()
    setCurrentRoute(route)
    navigation.navigate(route)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.iconContainer} 
        onPress={() => changePage('Home')}
      >
        <Icon name="home" size={30} color={currentRoute === 'Home' ? "#FFBF00" : "#616161"} />
        <Text style={[styles.iconText, currentRoute === 'Home' && styles.iconTextSelected]}>HOME</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.iconContainer} 
        onPress={() => changePage('Library')}
      >
        <Icon name="book" size={30} color={currentRoute === 'Library' || currentRoute === "Chapter" ? "#FFBF00" : "#616161"} />
        <Text style={[styles.iconText, currentRoute === 'Library' && styles.iconTextSelected]}>LIBRARY</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 90,
    maxHeight: 90,
    backgroundColor: '#fff',
    paddingTop: 10,
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  iconText: {
    color: '#616161',
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  iconTextSelected: {
    color: '#FFBF00',
  }
})