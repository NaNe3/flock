import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { gen } from "../../utils/styling/colors"
import Avatar from "../../components/Avatar"
import AcceptReject from "./AcceptReject"
import { timeAgo } from "../../utils/timeDiff"
import { hapticSelect } from "../../utils/haptics"
import { resolveFriendRequest } from "../../utils/db-relationship"
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../../utils/localStorage"

export default function FriendRequestContainer({ navigation, requests, setRequests }) {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }

    init()
  }, [])
  
  const resolveRequest = async (friend, action) => {
    hapticSelect()
    // set status to accepted in relationship
    
    try {
      const { error } = await resolveFriendRequest(userId, friend.id, action)
      if (!error) {
        // add request into friends
        const friends = JSON.parse(await getLocallyStoredVariable('user_friends'))
        if (action === 'accepted') {
          const newFriends = [...friends, {...friend, status: 'accepted'}]
          await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        } else {
          const newFriends = friends.filter(f => f.id !== friend.id)
          await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        }

        // remove request from requests via setRequests
        const updatedRequests = requests.filter(request => request.id !== friend.id)
        setRequests(updatedRequests)

        // localStorage friendRequests change to reflect new state
        await setLocallyStoredVariable('user_friend_requests', JSON.stringify(updatedRequests))
      }
    } catch (error) {
      console.log('Error resolving friend request: ', error)
    }
  }

  // const reject = async (friend_id) => {
  //   hapticSelect()

  //   const { error } = await rejectFriendRequest(userId, friend_id)
  //   if (!error) {
  //     // remove request from requests via setRequests
  //     const updatedRequests = requests.filter(request => request.id !== friend_id)
  //     setRequests(updatedRequests)

  //     // localStorage friendRequests change to reflect new state
  //     await setLocallyStoredVariable('user_friend_requests', JSON.stringify(updatedRequests))
  //   }
  // }

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
                <View style={[styles.avatar, { borderColor: 1 ? gen.primaryBorder : request.color }]}>
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

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: gen.primaryBackground,
    borderRadius: 15,
  },
  headerText: {
    color: gen.primaryText,
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  row: {
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: gen.primaryBorder,
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
    borderColor: gen.primaryBorder,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  requestName: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.primaryText
  },
  requestTime: {
    fontFamily: 'nunito-regular',
    fontSize: 14,
    color: gen.tertiaryText
  }
})