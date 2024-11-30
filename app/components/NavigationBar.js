import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";

export default function NavigationBar({ currentRoute, setCurrentRoute }) {
  const navigation = useNavigation()

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
        <Icon name="house" size={23} color={currentRoute === 'Home' ? gen.primaryColor : gen.actionText }/>
        <Text style={[styles.iconText, currentRoute === 'Home' && styles.iconTextSelected]}>HOME</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconContainer} 
        onPress={() => changePage('GroupPage')}
      >
        <Icon name="people-pulling" size={23} color={currentRoute === 'GroupPage' ? gen.primaryColor : gen.actionText } />
        <Text style={[styles.iconText, currentRoute === 'GroupPage' && styles.iconTextSelected]}>GROUPS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconContainer} 
        onPress={() => changePage('LibraryPage')}
      >
        <Icon name="book" size={23} color={currentRoute === 'LibraryPage' || currentRoute === "Chapter" ? gen.primaryColor : gen.actionText } />
        <Text style={[styles.iconText, currentRoute === 'LibraryPage' && styles.iconTextSelected]}>LIBRARY</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 90,
    maxHeight: 90,
    backgroundColor: gen.primaryBackground,
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
    color: gen.actionText,
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  iconTextSelected: {
    color: gen.primaryColor,
  }
})