import supabase from "./supabase";

export const sendMessageInPrivateChat = async ({ sender_id, recipient_id, message }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .insert([
        { sender_id, recipient_id, message }
      ])
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message_id, message, created_at
      `)

    if (error) {
      console.error('Error sending message:', error)
      return { error: error}
    }

    return data.map(message => {
      const { sender_id, ...rest } = message
      const { color_id, ...author } = sender_id

      return {
        ...rest,
        author: {
          ...author,
          color: color_id.color_hex
        }
      }
    })[0]
  } catch (error) {
    console.error('Error sending message:', error)
    return { error: error }
  }
}

export const sendMessageToGroupChat = async ({ sender_id, group_id, message }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .insert([
        { sender_id, group_id, message }
      ])
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message_id, message, created_at
      `)

    if (error) {
      console.error('Error sending message:', error)
      return { error: error}
    }

    return data.map(message => {
      const { sender_id, ...rest } = message
      const { color_id, ...author } = sender_id

      return {
        ...rest,
        author: {
          ...author,
          color: color_id.color_hex
        }
      }
    })[0]
  } catch (error) {
    console.error('Error sending message:', error)
    return { error: error }
  }
}

export const getSingleMessageById = async (message_id) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        sender_id(id, full_name, fname, lname, avatar_path, color_id(color_hex)),
        group_id(group_id, group_name, group_image),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message_id, message, created_at
      `)
      .eq('message_id', message_id)

    if (error) {
      console.error('Error getting message:', error)
      return { error: error}
    }

    return data.map(message => {
      const { sender_id, group_id, ...rest } = message
      const { color_id, ...author } = sender_id

      const group = group_id ? group_id : null

      return {
        ...rest,
        group: group,
        author: {
          ...author,
          color: color_id.color_hex
        }
      }
    })[0]
  } catch (error) {
    console.error('Error getting message:', error)
    return { error: error }
  }
}

export const getMessagesInPrivateChat = async ({ sender_id, recipient_id, start=0, offset=40 }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message_id, message, created_at
      `)
      .or(`and(sender_id.eq.${sender_id},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${sender_id})`)
      .order('created_at', { ascending: false })
      .range(start, start+offset-1);

    if (error) {
      console.error('Error getting messages:', error)
      return { error: error}
    }

    return data.reverse().map(message => {
      const { sender_id, ...rest } = message
      const { color_id, ...author } = sender_id

      return {
        ...rest,
        author: {
          ...author,
          color: color_id.color_hex
        }
      }
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return { error: error }
  }
}

export const getMessagesInGroupChat = async ({ group_id, start=0, offset=40 }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message_id, message, created_at
      `)
      .eq('group_id', group_id)
      .order('created_at', { ascending: false })
      .range(start, start+offset-1);

    if (error) {
      console.error('Error getting messages:', error)
      return { error: error}
    }

    return data.reverse().map(message => {
      const { sender_id, ...rest } = message
      const { color_id, ...author } = sender_id

      return {
        ...rest,
        author: {
          ...author,
          color: color_id.color_hex
        }
      }
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return { error: error }
  }
}

export const getMessagesFromFriendsAndGroups = async ({ sender_id, group_ids, friend_ids }) => {
  // .or(`column1.in.(${array1.join(',')}),column2.in.(${array2.join(',')})`)
  const group_messages = { }
  for (const group_id of group_ids) {
    const groupMessages = await getMessagesInGroupChat({ group_id })
    group_messages[`group-${group_id}`] = groupMessages
  }

  const friend_messages = {}
  for (const friend_id of friend_ids) {
    const friendMessages = await getMessagesInPrivateChat({ sender_id, recipient_id: friend_id })
    friend_messages[`friend-${friend_id}`] = friendMessages
  }

  return {
    ...group_messages,
    ...friend_messages
  }
}

export const getChatStateOfRelationship = async ({ user_id, relationship_id }) => {
  const { data, error } = await supabase
    .from('chat_state')
    .select(`
      created_at, group_id, 
      relationship_id(relationship_id, user_one, user_two),
      last_message_seen(message_id, created_at)
    `)
    .eq('user_id', user_id)
    .eq('relationship_id', relationship_id)

  if (error) {
    console.error('Error getting chat state:', error)
    return { error: error }
  }

  const chatState = data[0]
  return {
    ...chatState,
    new_message_count: 0
  }
}

export const getChatStates = async ({ user_id }) => {
  const { data: chatStates, error: chatStatesError } = await supabase
    .from('chat_state')
    .select(`
      created_at, group_id, 
      relationship_id(relationship_id, user_one, user_two),
      last_message_seen(message_id, created_at)
    `)
    .eq('user_id', user_id)

  if (chatStatesError) {
    console.error('Error getting chat states:', error)
    return { error: error }
  }

  const updatedChatStates = await Promise.all(
    chatStates.map(async (chatState) => {
      if (chatState.last_message_seen) {
        if (chatState.relationship_id) {
          const userOne = chatState.relationship_id.user_one
          const userTwo = chatState.relationship_id.user_two
          const { count, error: countError } = await supabase
            .from('message')
            .select('*', { count: 'exact', head: true })
            .or(`and(sender_id.eq.${userOne},recipient_id.eq.${userTwo}),and(sender_id.eq.${userTwo},recipient_id.eq.${userOne})`)
            .gt('message_id', chatState.last_message_seen.message_id)
          if (countError) {
            console.error('Error counting messages:', countError)
            chatState.new_message_count = 0
          } else {
            chatState.new_message_count = count
          }
        } else {
          const { count, error: countError } = await supabase
            .from('message')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', chatState.group_id)
            .gt('message_id', chatState.last_message_seen.message_id)
          if (countError) {
            console.error('Error counting messages:', countError)
            chatState.new_message_count = 0
          } else {
            chatState.new_message_count = count
          }
        }
      } else {
        if (chatState.relationship_id) {
          const userOne = chatState.relationship_id.user_one
          const userTwo = chatState.relationship_id.user_two
          const { count, error: countError } = await supabase
            .from('message')
            .select('*', { count: 'exact', head: true })
            .or(`and(sender_id.eq.${userOne},recipient_id.eq.${userTwo}),and(sender_id.eq.${userTwo},recipient_id.eq.${userOne})`)
          if (countError) {
            console.error('Error counting messages:', countError)
            chatState.new_message_count = 0
          } else {
            chatState.new_message_count = count
          }
        } else {
          const { count, error: countError } = await supabase
            .from('message')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', chatState.group_id)
          if (countError) {
            console.error('Error counting messages:', countError)
            chatState.new_message_count = 0
          } else {
            chatState.new_message_count = count
          }
        }
      }
      return chatState
    })
  )

  return updatedChatStates
}

export const createRelationshipChatStates = async ({ user_id, friend_id, relationship_id}) => {
  try {
    const { error } = await supabase
      .from('chat_state')
      .insert([
        { user_id, relationship_id },
        { user_id: friend_id, relationship_id }
      ])
    if (error) {
      console.error('Error creating chat state:', error)
      return { error: error}
    }
    return true
  } catch (error) {
    console.error('Error creating chat state:', error)
    return { error: error }
  }
}

export const removeRelationshipChatStates = async (relationship_id) => {
  try {
    const { error } = await supabase
      .from('chat_state')
      .delete()
      .eq('relationship_id', relationship_id)

    if (error) {
      console.error('Error removing chat state:', error)
      return { error: error}
    }
    return true
  } catch (error) {
    console.error('Error removing chat state:', error)
    return { error: error }
  }
}

export const removeSingleGroupChatState = async (user_id, group_id) => {
  try {
    const { error } = await supabase
      .from('chat_state')
      .delete()
      .eq('user_id', user_id)
      .eq('group_id', group_id)

    if (error) {
      console.error('Error removing chat state:', error)
      return { error: error}
    }
    return true
  } catch (error) {
    console.error('Error removing chat state:', error)
    return { error: error }
  }
}

export const syncChatStates = async (allRelationships) => {
  const rowsToUpsert = []

  allRelationships.forEach(rel => {
    rowsToUpsert.push({ user_id: rel.user_one, relationship_id: rel.relationship_id })
    rowsToUpsert.push({ user_id: rel.user_two, relationship_id: rel.relationship_id })
  })

  const { data, error } = await supabase
    .from('chat_state')
    .upsert(rowsToUpsert)

  if (error) {
    console.error('Error syncing chat states:', error)
    return { error: error}
  }

  return data
}

export const updateLastMessageSeen = async ({ user_id, message_id, relationship_id, group_id }) => {
  try {
    const type = relationship_id ? 'relationship_id' : 'group_id'
    const value = relationship_id ? relationship_id : group_id

    const { error } = await supabase
      .from('chat_state')
      .update({ last_message_seen: message_id })
      .eq('user_id', user_id)
      .eq(type, value)

    if (error) {
      console.error('Error updating chat state:', error)
      return { error: error}
    }

    return true
  } catch (error) {
    console.error('Error updating chat state:', error)
    return { error: error }
  }
}