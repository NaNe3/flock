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

export async function getComments(work, book, chapter, verse) {
  const { data: comments, error } = await supabase
    .from('activity')
    .select(`
      activity_id,
      comment(*),
      user(avatar_path, fname, lname)
    `)
    .eq('work', work)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .not('comment_id', 'is', null)
    .order('created_at', { ascending: false })

  return { comments: comments, error: error }
}

export async function addComment({ work, book, chapter, verse, user_id, comment }) {
  const { data: commentRow, error: commentError } = await supabase
    .from('comment')
    .insert({ comment: comment})
    .select('comment_id')

  if (!commentError) {
    // 2) create LIKE log
    const { data: activityRow, error: activityError } = await supabase
      .from('activity')
      .insert({ work, book, chapter, verse, comment_id: commentRow[0].comment_id, user_id: user_id })
      .select()

    if (!activityError) {
      return { commentRow: commentRow, activityRow: activityRow, activityError: activityError }
    } else {
      console.error(activityError)
      return { error: activityError }
    }
  } else {
    console.error(error)
    return { error: commentError }
  }
}