import { createContext, useContext, useEffect, useRef, useState } from 'react';

import supabase from '../utils/supabase';
import { createActivityListeners, createReactionListener, incomingRequestListener, requestResponseListener } from '../utils/realtime';
import NotificationBody from '../components/NotificationBody';
import { getInfoFromGroupMember, getSenderInformation } from '../utils/db-relationship';
import { getLocallyStoredVariable, setLocallyStoredVariable } from '../utils/localStorage';
import { getLocationOfMedia, getReactionInformation } from '../utils/db-media';
import { gen } from '../utils/styling/colors';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children, realtimeData }) => {
  const channel = useRef(null)
  const [userId] = useState(realtimeData.userId)
  const [media, setMedia] = useState([])
  const [friends, setFriends] = useState(
    realtimeData.friends.filter(friend => friend.status === 'accepted').map(friend => friend.id)
  )
  const [incoming, setIncoming] = useState(null)
  const [requested, setRequested] = useState(null)
  const [groupInvites, setGroupInvites] = useState(null)

  const [queue, setQueue] = useState([])
  const [displayedNotification, setDisplayedNotification] = useState(null)

  const addListener = (method, table, callback) => {
    if (!channel.current){
      console.log('Channel not initialized')
      return
    }
    channel.current.on('postgres_changes', {
      event: method, schema: 'public', table
    }, (payload) => callback(payload))
  }

  useEffect(() => {
    channel.current = supabase.channel('realtime:rue')
      
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
      
    channel.current.subscribe()
    return () => {
      if (channel.current) {
        supabase.removeChannel(channel.current);
      }
    }
  }, [])

  const publishReaction = async (reaction) => {
    const { reaction_id } = reaction
    const sender = await getReactionInformation(reaction_id)
    const location = await getLocationOfMedia(sender.media_id)

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
    const friends = JSON.parse(await getLocallyStoredVariable('user_friends'))
    const newFriends = friends.map(friend => {
      if (friend.id === recipientId) {
        publishNotification({ image: friend.avatar_path, title: `${friend.fname} ${friend.lname}`, body: 'accepted your friend request', color: friend.color, route: { name: 'AddFriend', params: null } })

        return { ...friend, status: 'accepted' }
      } else { return friend }
    }, proceed)
    await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))

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
      const result = await getInfoFromGroupMember(groupMemberInfo.group_member_id)
      publishNotification({ image: result.group.group_image, title: `${result.full_name}`, body: `invited you to join ${result.group.group_name}`, color: result.color, route: { name: 'GroupPage', params: null } })
      setGroupInvites(result.group.group_name)
    }
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

  // useEffect(() => {
  //   console.log("queue", queue)
  //   console.log("displayed", displayedNotification)
  // }, [queue, displayedNotification])

  return (
    <RealtimeContext.Provider value={{ media, incoming, requested, groupInvites }}>
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
