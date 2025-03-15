import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Avatar from "../../components/Avatar"
import AcceptReject from "./AcceptReject"
import { timeAgo } from "../../utils/timeDiff"
import { hapticSelect } from "../../utils/haptics"
import { resolveFriendRequest } from "../../utils/db-relationship"
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../../utils/localStorage"
import { useTheme } from "../../hooks/ThemeProvider"
import { useHolos } from "../../hooks/HolosProvider"

export default function FriendRequestContainer({ navigation, requests, setRequests }) {
  const { theme } = useTheme()
  const { setFriends, friends } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }

    init()
  }, [])
  
  const resolveRequest = async (friend, action) => {
    console.log('Resolving request: ', friend, action)
    hapticSelect()
    // set status to accepted in relationship
    
    try {
      const { error } = await resolveFriendRequest(userId, friend.id, action)
      if (!error) {
        // add request into friends
        if (action === 'accepted') {
          const newFriends = [...friends, {...friend, status: 'accepted'}]
          setFriends(newFriends)
          // await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        } else {
          const newFriends = friends.filter(f => f.id !== friend.id)
          setFriends(newFriends)
          // await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        }

        // remove request from requests via setRequests
        const updatedRequests = requests.filter(request => request.id !== friend.id)
        setRequests(updatedRequests)
        await setLocallyStoredVariable('user_friend_requests', JSON.stringify(updatedRequests))
      }
    } catch (error) {
      console.log('Error resolving friend request: ', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.headerText}>friend requests ({requests.length})</Text>
      </View>
      {
        requests.map((request, index) => {
          const time = timeAgo(request.created_at)
          return (
            <View style={[styles.row, index === requests.length-1 && { borderBottomWidth: 0 }]} key={index}>
              <View style={styles.rowContent}>
                <View style={[styles.avatar, { borderColor: 1 ? theme.primaryBorder : request.color }]}>
                  <Avatar 
                    style={{ flex: 1, borderRadius: 30 }}
                    imagePath={request.avatar_path} 
                  />
                </View>
                <View style={styles.requestInfo}>
                  <Text 
                    style={styles.requestName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{request.fname} {request.lname}</Text>
                  <Text style={styles.requestTime}>sent {time} ago</Text>
                </View>
              </View>
              <AcceptReject 
                accept={() => resolveRequest(request, "accepted")} 
                reject={() => resolveRequest(request, "rejected")} 
              />
            </View>

          )
        })
      }
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      marginTop: 10,
      marginHorizontal: 20,
      backgroundColor: theme.primaryBackground,
      borderRadius: 15,
    },
    headerText: {
      color: theme.primaryText,
      fontSize: 16,
      fontFamily: 'nunito-bold',
    },
    row: {
      padding: 15,
      borderBottomWidth: 2,
      borderBottomColor: theme.primaryBorder,
      flexDirection: 'column',
    },
    rowContent: {
      flexDirection: 'row', 
      marginBottom: 10
    },
    avatar: {
      width: 60, 
      height: 60, 
      borderRadius: 30,
      overflow: 'hidden',
      padding: 3,
      borderWidth: 3,
      borderColor: theme.primaryBorder,
    },
    requestInfo: {
      flex: 1,
      marginLeft: 15,
      justifyContent: 'center',
    },
    requestName: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.primaryText
    },
    requestTime: {
      fontFamily: 'nunito-regular',
      fontSize: 14,
      color: theme.tertiaryText
    }
  })
}