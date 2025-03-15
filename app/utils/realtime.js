export const createMessageListeners = (channel, user_id, group_ids, callback) => {
  createListener(channel, 'INSERT', 'message', `recipient_id=eq.${user_id}`, (payload) => { callback(payload) })

  group_ids.forEach(group_id => {
    createListener(channel, 'INSERT', 'message', `group_id=eq.${group_id}`, (payload) => { callback(payload) })
  })
}

export const createActivityListeners = (channel, users, callback) => {
  users.forEach(user => {
    createListener(channel, 'INSERT', 'activity', `user_id=eq.${user.id}`, (payload) => { callback(payload) })
  })
}

export const createReactionListener = (channel, user_id, callback) => {
  createListener(channel, 'INSERT', 'reaction', `recipient_user_id=eq.${user_id}`, (payload) => { callback(payload) })
}

export const requestResponseListener = (channel, user_id, callback) => {
  try {
    createListener(channel, 'UPDATE', 'relationship', `user_one=eq.${user_id}`, (payload) => { callback(payload) })
  } catch (error) {
    console.log(error)
  }
}

export const incomingRequestListener = (channel, user_id, callback) => {
  try {
    createListener(channel, 'INSERT', 'relationship', `user_two=eq.${user_id}`, (payload) => { callback(payload, "friend") })
    createListener(channel, 'INSERT', 'group_member', `user_id=eq.${user_id}`, (payload) => { callback(payload, "group") })
  } catch (error) {
    console.log(error)
  }
}

export const incomingCommentListener = (channel, user_id, callback) => {
  createListener(channel, 'INSERT', 'media_comment', `recipient_id=eq.${user_id}`, (payload) => { callback(payload) })
}

const createListener = (channel, event, table, filter, callback) => {
  channel.on('postgres_changes', {
    event: event, schema: 'public', table: table, filter: filter
  }, (payload) => callback(payload))
}
