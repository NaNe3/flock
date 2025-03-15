import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome6'
import HugeIcon from "./HugeIcon";

import { hapticSelect } from "../utils/haptics";
import { getLocallyStoredVariable } from "../utils/localStorage";
import NotificationIndicator from "./NotificationIndicator";
import { useRealtime } from "../hooks/RealtimeProvider";
import { useTheme } from "../hooks/ThemeProvider";
import { useHolos } from "../hooks/HolosProvider";

export default function NavigationBar({ currentRoute, setCurrentRoute }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const { incoming } = useRealtime()
  const { totalUnseenMessages } = useHolos()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const [invitationCount, setInvitationCount] = useState(0)
  const [totalIndications, setTotalIndications] = useState(0)
  const [friendsOpened, setFriendsOpened] = useState(false)

  const routes = [
    {
      icon: 'home',
      route: 'Home',
      name: 'home',
    },
    {
      icon: 'message-bubble',
      route: 'FriendsPage',
      name: 'friends',
    },
    {
      icon: 'book-bookmark',
      route: 'LibraryPage',
      name: 'library',
    },
  ]
  const routeScale = useRef(routes.map(() => new Animated.Value(1))).current

  const init = async () => {
    const friendRequests = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    setInvitationCount(friendRequests.length)
  }

  useEffect(() => { init() }, [])
  useEffect(() => {
    const trigger = async () => { await init() }
    if (incoming !== null) { trigger() }
  }, [incoming])

  useEffect(() => {
    setTotalIndications(totalUnseenMessages + invitationCount)
  }, [totalUnseenMessages, invitationCount])

  const changePage = (route) => {
    hapticSelect()
    setCurrentRoute(route)
    if (route === 'FriendsPage') setFriendsOpened(true)
    navigation.navigate(route)
  }

  const handleRoutePressIn = (index) => {
    Animated.spring(routeScale[index], {
      toValue: 0.9,
      useNativeDriver: true,
    }).start()
  }

  const handleRoutePressOut = (index) => {
    Animated.spring(routeScale[index], {
      toValue: 0.9,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(routeScale[index], {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    })
  }

  return (
    <View style={[styles.container, { height: 66 + insets.bottom }]}>
      <View style={styles.contentContainer}>
        {routes.map((r, i) => (
          <TouchableOpacity
            key={`navigation-item-${i}`}
            activeOpacity={1}
            onPress={() => changePage(r.route)}
            onPressIn={() => handleRoutePressIn(i)}
            onPressOut={() => handleRoutePressOut(i)}
          >
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: routeScale[i] }] }]}>
              {r.route === 'FriendsPage' && totalIndications > 0 && !friendsOpened && (
                <NotificationIndicator count={totalIndications} offset={-15} />
              )}
              <HugeIcon
                icon={r.icon} 
                size={28} 
                color={currentRoute === r.route ? theme.navigationSelected : theme.navigationUnselected} 
              />
              <Text style={[styles.iconText, currentRoute === r.route && styles.iconTextSelected]}>{r.name}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      maxHeight: 90,
      backgroundColor: theme.primaryBackground,
    },
    contentContainer: {
      height: 66,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
    },
    iconText: {
      color: theme.navigationUnselected,
      fontSize: 12,
      fontFamily: 'nunito-bold',
    },
    iconTextSelected: {
      color: theme.navigationSelected,
    }
  })
}