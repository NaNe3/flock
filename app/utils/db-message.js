import supabase from "./supabase";

export const sendMessageInPrivateChat = async ({ sender_id, recipient_id, message }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .insert([
        { sender_id, recipient_id, message }
      ])

    if (error) {
      console.error('Error sending message:', error)
      return { error: error}
    }

    return { data: data }
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

    if (error) {
      console.error('Error sending message:', error)
      return { error: error}
    }

    return { data: data }
  } catch (error) {
    console.error('Error sending message:', error)
    return { error: error }
  }
}

export const getMessagesInPrivateChat = async ({ sender_id, recipient_id }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message, created_at, seen
      `)
      .or(`and(sender_id.eq.${sender_id},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${sender_id})`)
      .order('created_at', { ascending: true })
      .limit(40);

    if (error) {
      console.error('Error getting messages:', error)
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
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return { error: error }
  }
}

export const getMessagesInGroupChat = async ({ group_id }) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        sender_id(id, full_name, avatar_path, color_id(color_hex)),
        log_id(log_id, plan_item_id, work, book, chapter, verses),
        message, created_at, seen
      `)
      .eq('group_id', group_id)
      .order('created_at', { ascending: true })
      .limit(40);

    if (error) {
      console.error('Error getting messages:', error)
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
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return { error: error }
  }
}

export const getMessagesFromFriendsAndGroups = async ({ sender_id, group_ids, friend_ids }) => {
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