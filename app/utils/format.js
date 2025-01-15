export const formatActivityFromSupabase = (data) => {
  return data.map(activity => {
    return {
      activity_id: activity.activity_id,
      verse: activity.verse,
      color: activity.user.color_id.color_hex,
    }
  })
}

export const formatFriendsFromSupabase = (data, user_id) => {
  if (Array.isArray(data)) {
    return data.map(item => {
      const focus = item.user_two.id !== user_id ? item.user_two : item.user_one
      const { color_id, ...user} = focus

      const lastStudied = user.last_studied ? user.last_studied.created_at : null
      return {
        status: item.status,
        invited_by: item.invited_by,
        color: color_id.color_hex,
        ...user,
        last_studied: lastStudied,
      }
    })
  } else {
    const focus = data.user_two.id !== user_id ? data.user_two : data.user_one
    const { color_id, ...user} = focus

    const lastStudied = user.last_studied ? user.last_studied.created_at : null
    return {
      status: data.status,
      invited_by: data.invited_by,
      color: color_id.color_hex,
      ...user,
      last_studied: lastStudied,
    }
  }
}