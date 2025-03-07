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
        message, created_at, seen_by_recipient
      `)
      .or(`and(sender_id.eq.${sender_id},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${sender_id})`)
      .order('created_at', { ascending: true });

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
        message, created_at
      `)
      .eq('group_id', group_id)
      .order('created_at', { ascending: true });

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