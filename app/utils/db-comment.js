import { updateLastImpression } from "./db-media";
import supabase from "./supabase";

export function getTimeSincePosted(date) {
  const now = new Date()
  const posted = new Date(date)
  const diff = now - posted

  if (diff < 1000) {
    return "just now"
  } else if (diff < 60000) {
    return `${Math.floor(diff / 1000)}s`
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}d`
  } else if (diff < 2628000000) {
    return `${Math.floor(diff / 604800000)}w`
  } else if (diff < 31536000000) {
    return `${Math.floor(diff / 2628000000)}mo`
  } else {
    return `${Math.floor(diff / 31536000000)}y`
  }
}

export async function getReplies(commentIds) {
  const { data: replies, error } = await supabase
    .from('media_comment')
    .select(`
      media_comment_id, created_at, comment, replying_to, media_id, reply_count,
      user_id (id, full_name, avatar_path, color_id(color_hex))
    `)
    .in('replying_to', commentIds)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('error', error)
    return { error: error }
  }

  const newReplies = replies.map(c => {
    const { user_id: user, ...comment} = c
    return { user, ...comment, }
  })
  return newReplies
}

export async function getComments(media_id, column) {
  const { data: comments, error } = await supabase
    .from('media_comment')
    .select(`
      media_comment_id, created_at, comment, replying_to, media_id, reply_count,
      user_id (id, full_name, avatar_path, color_id(color_hex))
    `)
    .eq(column, media_id)
    .is('replying_to', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('error', error)
    return { error: error }
  }

  const newComments = comments.map(c => {
    const { user_id: user, ...comment} = c
    return { user, ...comment, }
  })
  return newComments
}

export async function getCommentCount(media_id, column) {
  const { count, error } = await supabase
    .from('media_comment')
    .select('*', { count: 'exact', head: true })
    .eq(column, media_id)

  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  return count
}

export async function createComment({ media_id, comment_id, user_id, replying_to, recipient_id, comment }) {
  const { data, error } = await supabase
    .from('media_comment')
    .insert([
      {
        media_id: media_id,
        comment_id: comment_id,
        user_id: user_id,
        replying_to: replying_to,
        recipient_id: recipient_id,
        comment: comment,
      }
    ])

  if (error) {
    console.error('error', error)
    return { error: error }
  }

  if (replying_to !== null) {
    const { data: currentReplyCount, error: getCountError } = await supabase
      .from('media_comment')
      .select('reply_count')
      .eq('media_comment_id', replying_to)
    if (getCountError) { console.error('error', getCountError) }

    const newReplyCount = currentReplyCount[0].reply_count + 1

    const { error: updateError } = await supabase
      .from('media_comment')
      .update({ reply_count: newReplyCount })
      .eq('media_comment_id', replying_to)
    if (updateError) { console.error('error', updateError) }
  }
}

export async function publishMainComment({ comment, color_scheme, user_id, group_id, location }) {
  // 1. create comment row
  const { data, error } = await supabase
    .from('comment')
    .insert([ { comment: comment, color_scheme: color_scheme } ])
    .select()

  if (!error) {
    // 2. create activity row
    // reqs: work, book, chapter, verse, user_id, group_id, comment_id
    const { work, book, chapter, verse } = location
    const { error: activityError } = await supabase
      .from('activity')
      .insert([
        {
          work: work,
          book: book,
          chapter: chapter,
          verse: verse,
          group_id: group_id,
          user_id: user_id,
          comment_id: data[0].comment_id
        }
      ])

    await updateLastImpression({ user_id, recipient_id: group_id })
  
    if (activityError) {
      console.error('activityError', activityError)
      return { error: activityError }
    }
  } else {
    console.error('error in creating commetn: ', error)
    return { error: error }
  }
}

export const getCommentInformation = async (media_comment_id) => {
  const { data, error } = await supabase
    .from('media_comment')
    .select(` user_id (id, full_name, avatar_path, color_id(color_hex)) `)
    .eq('media_comment_id', media_comment_id)

  if (error) {
    console.error('error', error)
    return { error: error }
  }

  const { color_id, ...user } = data[0].user_id
  return { ...user, color: color_id.color_hex }
}
