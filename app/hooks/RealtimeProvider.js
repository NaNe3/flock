import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native'
import supabase from '../utils/supabase';

import { createActivityListeners, createGroupMessageListener, createMessageListeners, createReactionListener, incomingCommentListener, incomingRequestListener, requestResponseListener } from '../utils/realtime';
import NotificationBody from '../components/NotificationBody';
import { getGroupById, getSenderInformation } from '../utils/db-relationship';
import { getLocallyStoredVariable, setLocallyStoredVariable } from '../utils/localStorage';
import { getLocationOfActivity, getReactionInformation } from '../utils/db-media';
import { getCommentInformation } from '../utils/db-comment';
import { getSingleMessageById } from '../utils/db-message';
import { useHolos } from './HolosProvider'

const RealtimeContext = createContext()

export const RealtimeProvider = ({ children, realtimeData, route }) => {
  const { setMessages, setChatStates, groups, setGroups, friends, setFriends } = useHolos()
  const channel = useRef(null)
  const [userId] = useState(realtimeData.userId)
  const [media, setMedia] = useState([])
  const [groupIds, setGroupIds] = useState(realtimeData.groups.map(group => group.group_id))
  const [incoming, setIncoming] = useState(null)
  const [requested, setRequested] = useState(null)

  const routeRef = useRef(route)

  useEffect(() => {
    if (route === null || route === undefined) return
    routeRef.current = route
  }, [route])

  const [queue, setQueue] = useState([])
  const [displayedNotification, setDisplayedNotification] = useState(null)

  const addListener = (method, table, callback) => {
    if (!channel.current) {
      console.log('Channel not initialized')
      return
    }
    channel.current.on('postgres_changes', {
      event: method, schema: 'public', table
    }, (payload) => callback(payload))
  }

  useEffect(() => {
    channel.current = supabase.channel('realtime:rue')

    createMessageListeners(channel.current, userId, groupIds, (payload) => {
      if (payload.new.sender_id !== userId) {
        messageRecieved(payload.new)
      }
    })
    createActivityListeners(channel.current, friends, (payload) => {
      setMedia([...media, payload.new]) // ensure that if a user is posting to a group, you only see it if you are in that group
    })
    createReactionListener(channel.current, userId, (payload) => {
      if (userId !== payload.new.sender_user_id) publishReaction(payload.new)
    })
    requestResponseListener(channel.current, userId, (payload) => {
      if (payload.new.status === 'accepted') {
        alterStatusToAccepted(userId, payload.new.user_two)
      }
    })
    incomingRequestListener(channel.current, userId, (payload, type) => {
      if (type === 'friend') {
        getNewFriendRequest(userId, payload.new.user_one) // A friend request has been sent to the user
      } else if (type === 'group') {
        getNewGroupRequest(payload.new)
      }
    })
    incomingCommentListener(channel.current, userId, (payload) => {
      console.log('incoming comment reply: ', payload)
      getNewCommentReply(payload.new)
    })
      
    channel.current.subscribe()
    return () => {
      if (channel.current) {
        supabase.removeChannel(channel.current);
      }
    }
  }, [])

  const getNewCommentReply = async (comment) => {
    const { media_comment_id } = comment
    const user = await getCommentInformation(media_comment_id)

    publishNotification({
      image: user.avatar_path,
      title: `${user.full_name} replied`,
      body: comment.comment,
      color: user.color,
      route: { name: 'AddFriend', params: null }
    })
  }

  const publishReaction = async (reaction) => {
    const { reaction_id } = reaction
    const sender = await getReactionInformation(reaction_id)
    const location = await getLocationOfActivity(sender.activity_id)

    // TODO - find the impression route
    publishNotification({
      image: sender.avatar_path,
      title: `${sender.full_name}`, 
      body: `reacted with ${reaction.emoji}`, 
      color: sender.color, 
      route: { name: 'ViewImpressions', params: { title: `${location.book} ${location.chapter}:${location.verse}`, media_id: sender.media_id } }
    })
  }

  const alterStatusToAccepted = async (userId, recipientId) => {
    setFriends((prev) => {
      return prev.map(friend => {
        if (friend.id === recipientId) {
          publishNotification({ image: friend.avatar_path, title: `${friend.fname} ${friend.lname}`, body: 'accepted your friend request', color: friend.color, route: { name: 'AddFriend', params: null } })
          return { ...friend, status: 'accepted' }
        } else { return friend }
      })
    })
    setRequested(userId)
  }

  const getNewFriendRequest = async (userId, senderId) => {
    const { data } = await getSenderInformation(userId, senderId)
    
    const friends = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    const newFriends = [...friends, data]
    await setLocallyStoredVariable('user_friend_requests', JSON.stringify(newFriends))
    publishNotification({ image: data.avatar_path, title: `${data.fname} ${data.lname}`, body: 'sent you a friend request', color: data.color, route: { name: 'AddFriend', params: null } })

    setIncoming(senderId)
  }

  const getNewGroupRequest = async (groupMemberInfo) => {
    if (!groupMemberInfo.is_leader) {
      const result = await getGroupById(userId, groupMemberInfo.group_id)      
      const group = result.data[0]
      const leader = group.members.find(member => member.is_leader)

      publishNotification({ image: group.group_image, title: `${leader.fname} ${leader.lname}`, body: `invited you to join ${group.group_name}`, color: leader.color, route: { name: 'FriendsPage', params: null } })
      setGroups((prev) => [...prev, { ...group, status: 'pending' }])
    }
  }

  const messageRecieved = async (message) => {
    if (message.sender_id === userId) return

    const data = await getSingleMessageById(message.message_id)
    const key = data.group_id ? `group-${data.group_id.group_id}` : `friend-${data.author.id}`
    setMessages(prev => {
      return { ...prev, [key]: [...prev[key], data] }
    })

    // only publish notificaiton if the user is not on the chat screen
    const currentRoute = routeRef.current;
    if (currentRoute) {
      if (currentRoute.name === 'PersonChat' && currentRoute.params.person.id === message.sender_id && message.group_id === null) {
        return
      }
      if (currentRoute.name === 'GroupChat' && currentRoute.params.group.group_id === message.group_id && message.group_id !== null) {
        return
      }
    }

    // NOTIFICAITON INFO
    let notification = {
      image: '',
      title: '',
      body: '',
      destination: '',
      item: ''
    }
    if (data.group) {
      const group = groups.find(group => parseInt(group.group_id) === data.group.group_id)
      notification = { title: `${data.group.group_name}`, image: data.group.group_image, body: `${data.author.full_name} says ${data.message}`, destination: 'GroupChat', item: group }
    } else {
      notification = { title: `${data.author.full_name}`, image: data.author.avatar_path, body: `${data.message}`, destination: 'PersonChat', item: { ...data.author, relationship_id: data.relationship_id } }
    }

    // PUBLISH LOCAL NOTIFICATION!!!
    publishNotification({
      image: notification.image,
      title: notification.title,
      body: notification.body,
      color: data.author.color,
      route: { name: notification.destination, params: {
          person: notification.destination === "PersonChat" ? notification.item : null,
          group: notification.destination === "GroupChat" ? notification.item : null
        } 
      }
    })

    // if notification is published, update the new message count!!!!
    setChatStates(prev => {
      return prev.map(chatState => {
        if (data.group_id !== null && data.group_id !== undefined) {
          if (chatState.group_id === data.group_id.group_id) {
            return { ...chatState, new_message_count: chatState.new_message_count + 1 }
          } else { return chatState }
        } else if (data.author !== null && data.author !== undefined) {
          if (chatState.relationship_id) {
            if (chatState.relationship_id.user_one === data.author.id || chatState.relationship_id.user_two === data.author.id) {
              return { ...chatState, new_message_count: chatState.new_message_count + 1 }
            } else { return chatState }
          } else { return chatState }
        }
      })
    })
  }

  const publishNotification = (notification) => {
    setQueue(prev => [...prev, notification])
    if (displayedNotification === null) {
      setDisplayedNotification(notification)
    }
  }

  const proceed = () => {
    const newQueue = [...queue]
    newQueue.shift()
    setQueue(newQueue)
    setDisplayedNotification(null)

    if (newQueue.length > 0) {
      setTimeout(() => {
        setDisplayedNotification(newQueue[0])
      }, 20)
    }
  }

  return (
    <RealtimeContext.Provider value={{ media, incoming, requested }}>
      {displayedNotification && (
        <NotificationBody
          image={displayedNotification.image}
          title={displayedNotification.title}
          body={displayedNotification.body}
          color={displayedNotification.color}
          route={displayedNotification.route}
          proceed={proceed}
        />
      )}
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  return useContext(RealtimeContext)
}
