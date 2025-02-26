import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../../hooks/ThemeProvider";
import Avatar from "../../components/Avatar";
import { getColorLight, getPrimaryColor } from "../../utils/getColorVariety";
import { useFocusEffect } from "@react-navigation/native";
import { hapticSelect } from "../../utils/haptics";

export default function GroupRow({ group, navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [leader] = useState(group.members.find(member => member.is_leader === true))
  const [color, setColor] = useState(null)
  const [light, setLight] = useState(null)

  const init = async () => {
    const color = await getPrimaryColor()
    const light = getColorLight(color)

    setColor(color)
    setLight(light)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  return (
    <TouchableOpacity 
      activeOpacity={group.status === 'pending' ? 0.4 : 0.7}
      onPress={() => {
        hapticSelect()
        navigation.navigate('Group', { 
          group
        }
      )}}
      style={[styles.groupRow, { opacity: group.status === 'pending' ? 0.5 : 1 }]}
    >
      <View style={styles.groupInformation}>
        <View style={styles.avatarContainer}>
          <Avatar
            imagePath={group.group_image}
            type="group"
            style={styles.avatar}
          />
        </View>
        <View style={styles.groupNameBox}>
          <Text
            style={styles.groupName}
            ellipsizeMode="tail"
            numberOfLines={1}
          >{group.group_name}</Text>
          <Text 
            style={styles.groupMembers}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {
              group.status === 'pending' 
                ? `invited by ${leader.fname} ${leader.lname}` 
                : `${group.members.length} members`
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function style(theme) {
  return StyleSheet.create({
    groupRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
    },
    groupInformation: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      padding: 2,
      borderWidth: 3,
      borderColor: theme.primaryBorder,
      width: 50,
      height: 50,
      borderRadius: 50,
      overflow: 'hidden',
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    avatarText: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.primaryText,
    },
    groupNameBox: {
      flex: 1,
      marginLeft: 10,
    },
    groupName: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.primaryText,
    },
    groupMembers: {
      fontFamily: 'nunito-bold',
      fontSize: 14,
      color: theme.gray,
    },
    rightIndicator: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    rightIndicatorTextContainer: {
      marginRight: 10,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rightIndicatorText: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
    },
  })
}