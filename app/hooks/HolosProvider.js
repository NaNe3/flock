import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from '../utils/localStorage';
import { getMessagesFromFriendsAndGroups } from '../utils/db-message';

const HolosContext = createContext();

export const HolosProvider = ({ children, realtimeData }) => {
  const [friends, setFriends] = useState([])
  const [friendIds, setFriendIds] = useState([])

  const [groups, setGroups] = useState([])
  const [groupIds, setGroupIds] = useState([])

  const [messages, setMessages] = useState({})
  const [chats, setChats] = useState([])

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()

    // get friends
    const friends = JSON.parse(await getLocallyStoredVariable('user_friends'))
    const friendIds = friends.filter(friend => friend.status === "accepted").map(friend => friend.id)
    setFriends(friends)

    // get groups
    const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
    const groupIds = groups.map(group => group.group_id)
    setGroups(groups)

    // get messages and organize chats
    const messages = await getMessagesFromFriendsAndGroups({ sender_id: userId, group_ids: groupIds, friend_ids: friendIds })
    Object.keys(messages).forEach(key => {

      // get last messages from each chat
      const chat = messages[key]
      if (chat.length > 0) {
        messages[key].last_message = chat[chat.length - 1].created_at
      } else {
        const id = key.split('-')[1]
        if (key.includes('group')) {
          messages[key].last_message = groups.find(group => group.group_id === id).created_at
        }
        if (key.includes('friend')) {
          messages[key].last_message = friends.find(friend => friend.id === parseInt(id)).created_at
        }
      }
    })

    const orderedChats = Object.keys(messages).sort(
      (a, b) => new Date(messages[b].last_message) - new Date(messages[a].last_message)
    )
    const orderedChatsWithUnseen = {}
    orderedChats.forEach(key => {
      const unread = messages[key].filter(message => !message.seen).length
      orderedChatsWithUnseen[key] = unread
    })

    const chats = []
    orderedChats.forEach(key => {
      const id = key.split('-')[1]
      if (key.includes('group')) {
        const group = groups.find(group => group.group_id === id)
        chats.push({ ...group, unread: orderedChatsWithUnseen[key] })
      }
      if (key.includes('friend')) {
        const friend = friends.find(friend => friend.id === parseInt(id))
        chats.push({ ...friend, unread: orderedChatsWithUnseen[key] })
      }
    })
    setChats(chats)
    setMessages(messages)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <HolosContext.Provider value={{ messages, chats }}>
      {children}
    </HolosContext.Provider>
  )
}

export const useHolos = () => {
  return useContext(HolosContext)
}
