import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from '../utils/localStorage';
import { createChatStates, getChatStateOfRelationship, getChatStates, getMessagesFromFriendsAndGroups } from '../utils/db-message';

const HolosContext = createContext();

export const HolosProvider = ({ children, realtimeData, holosData }) => {
  const [userId, setUserId] = useState(null)
  const initialized = useRef(false)

  const [friends, setFriends] = useState(realtimeData.friends)
  const [friendIds, setFriendIds] = useState(realtimeData.friendIds)
  const [friendRequests, setFriendRequests] = useState(realtimeData.friendRequests)

  const [groups, setGroups] = useState(realtimeData.groups)
  const [groupIds, setGroupIds] = useState(realtimeData.groupIds)

  const [chatStates, setChatStates] = useState(holosData.chatStates)
  const [messages, setMessages] = useState(holosData.messages)
  const [totalUnseenMessages, setTotalUnseenMessages] = useState(0)
  const [chats, setChats] = useState([])

  const [route, setRoute] = useState()

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    setUserId(userId)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (initialized.current) {
      actualizeGroups()
    }
  }, [groups])

  useEffect(() => {
    if (initialized.current) {
      actualizeFriends()
    }
  }, [friends])

  const actualizeGroups = async () => {
    // 1 - CHECK IF NEW GROUP HAS BEEN CREATED
    const newGroupChats = groups.filter(group => !groupIds.includes(group.group_id))
    if (newGroupChats.length > 0) {
      const newGroupIds = newGroupChats.map(group => group.group_id)
      setGroupIds([...groupIds, ...newGroupIds])

      const newChatStates = newGroupChats.map(group => {
        return {
          created_at: group.created_at,
          group_id: group.group_id,
          last_message_seen: null,
          new_message_count: 0,
          relationship_id: null,
        }
      })
    
      setChatStates([...chatStates, ...newChatStates])

      setMessages({
        ...messages,
        ...newGroupIds.reduce((acc, group_id) => {
          acc[`group-${group_id}`] = []
          return acc
        }, {})
      })
    }

    // 2 - CHECK IF A GROUP HAS BEEN DELETED
    const currentGroupIds = groups.map(group => group.group_id)
    const missingGroupChats = groupIds.filter(groupId => !currentGroupIds.includes(groupId))
    if (missingGroupChats.length > 0) {
      const newMessages = Object.keys(messages).reduce((acc, key) => {
        const currKey = key.split('-')
        if (!missingGroupChats.includes(currKey[1]) || currKey[0] !== 'group') {
          acc[key] = messages[key]
        }
        return acc
      }, {})
      setMessages(newMessages)
      setGroupIds(currentGroupIds)

      const newChatStates = chatStates.filter(chatState => !missingGroupChats.includes(chatState.group_id))
      setChatStates(newChatStates)
    }

    // 3 - SYNCHRONIZE GROUPS AND CHATS
    const newChats = chats.map(chat => {
      if (chat.group_id !== null && chat.group_id !== undefined) {
        const group = groups.find(group => parseInt(group.group_id) === parseInt(chat.group_id))
        const { new_message_count } = chat
        return {
          ...group,
          new_message_count,
        }
      } else {
        return chat
      }
    })
    setChats(newChats)
  }

  const actualizeFriends = async () => {
    // 1 - CHECK IF NEW FRIEND HAS BEEN ADDED
    const newFriendChats = friends.filter(friend => (!friendIds.includes(friend.id) && friend.status === 'accepted'))
    // friends is missing the relationship_id
    if (newFriendChats.length > 0) {
      setFriendIds([...friendIds, newFriendChats[0].id])

      const newChatState = await getChatStateOfRelationship({ user_id: userId, relationship_id: newFriendChats[0].relationship_id })
      setChatStates([...chatStates, newChatState])

      const newMessage = { [`friend-${newFriendChats[0].id}`]: [] }
      setMessages({
        ...messages,
        ...newMessage
      })
    }

    const currentFriendIds = friends.filter(friend => friend.status === "accepted").map(friend => friend.id)
    const missingFriends = friendIds.filter(friendId => !currentFriendIds.includes(friendId))
    if (missingFriends.length > 0) {
      const newMessages = Object.keys(messages).reduce((acc, key) => {
        const currKey = key.split('-')
        if (!missingFriends.includes(parseInt(currKey[1])) || currKey[0] !== 'friend') {
          acc[key] = messages[key]
        }
        return acc
      }, {})
      setMessages(newMessages)
      setFriendIds(currentFriendIds)

      const newChatStates = chatStates.filter(chatState => {
        if (chatState.relationship_id) {
          return !missingFriends.includes(parseInt(chatState.relationship_id.user_one)) && !missingFriends.includes(parseInt(chatState.relationship_id.user_two))
        } else { return true }
      })
      setChatStates(newChatStates)
    }
  }

  useEffect(() => {
    // this hook organizes the order of each chat based on the last message recieved
    if (messages.length !== 0 && chatStates.length !== 0 && userId !== null) {
      const last_messages = {}
      Object.keys(messages).forEach(key => {
        const chat = messages[key]
        if (chat.length > 0) {
          last_messages[key] = chat[chat.length - 1].created_at
        } else {
          const id = key.split('-')[1]
          if (key.includes('group')) {
            const chatState = chatStates.find(chatState => parseInt(chatState.group_id) === parseInt(id))
            last_messages[key] = chatState.created_at
          }
          if (key.includes('friend')) {
            const chatState = chatStates.find(chatState => {
              if (chatState.relationship_id) {
                return parseInt(chatState.relationship_id.user_one) === parseInt(id) || parseInt(chatState.relationship_id.user_two) === parseInt(id)
              } else { return false }
            })
            last_messages[key] = chatState.created_at
          }
        }
      })

      // sort chats by last_message
      const orderToDisplayChats = Object.keys(last_messages).sort((a, b) =>
        new Date(last_messages[b]) - new Date(last_messages[a])
      )
      const chats = orderToDisplayChats.map(key => {
        if (key.includes('group')) {
          const group = groups.find(group => parseInt(group.group_id) === parseInt(key.split('-')[1]))
          const chatState = chatStates.find(chatState => parseInt(chatState.group_id) === parseInt(key.split('-')[1]))
          return {
            ...group,
            new_message_count: chatState.new_message_count,
          }
        } else {
          const friend = friends.find(friend => parseInt(friend.id) === parseInt(key.split('-')[1]))
          const chatState = chatStates.find(chatState => {
            if (chatState.relationship_id) {
              return parseInt(chatState.relationship_id.user_one) === parseInt(friend.id) || parseInt(chatState.relationship_id.user_two) === parseInt(friend.id)
            } else { return false }
          })
          return {
            ...friend,
            new_message_count: chatState.new_message_count,
          }
        }
      })
      setChats(chats)

      const totalUnseen = chats.reduce((acc, chat) => acc + chat.new_message_count, 0)
      setTotalUnseenMessages(totalUnseen)
      initialized.current = true
    }
  }, [messages, chatStates, userId])

  return (
    <HolosContext.Provider value={{
      messages,
      setMessages,
      groups,
      setGroups,
      friends,
      setFriends,
      friendRequests,
      setFriendRequests,
      totalUnseenMessages,
      chats,
      setChatStates,
      route,
      setRoute
    }}>
      {children}
    </HolosContext.Provider>
  )
}

export const useHolos = () => {
  return useContext(HolosContext)
}
