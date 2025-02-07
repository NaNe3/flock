import supabase from "./supabase"

const isVerseLiked = async ({ location, user_id }) => {
  const { data, error } = await supabase
    .from('activity')
    .select('like_id')
    .eq('work', location.work)
    .eq('book', location.book)
    .eq('chapter', location.chapter)
    .eq('verse', location.verse)
    .eq('user_id', user_id)
    .not('like_id', 'is', null)

  if (error) {
    console.error('error', error)
  } else {
    if (data.length > 0) {
      console.log("data", data)
      return { alreadyLiked: true, like_id: data[0].like_id }
    } else {
      return { alreadyLiked: false, like_id: null }
    }
  }
}

const deleteLike = async ({ location, user_id, like_id }) => {
  // 1 - delete activity row
  const { data, error } = await supabase
    .from('activity')
    .delete()
    .eq('like_id', like_id)

  // 2 - delete like row
  const { data: likeData, error: likeError } = await supabase
    .from('likes')
    .delete()
    .eq('like_id', like_id)
}

const createLike = async ({ location, user_id }) => {
  // 1 - create like row 
  const { data, error } = await supabase
    .from('likes')
    .insert([ { user_id } ])
    .select('like_id')

  // 2 - create activity row
  const { data: activityData, error: activityError } = await supabase
    .from('activity')
    .insert({
      user_id,
      work: location.work,
      book: location.book,
      chapter: location.chapter,
      verse: location.verse,
      like_id: data[0].like_id
    })
}

export const invokeLikeVerse = async ({ location, user_id}) => {
  const { alreadyLiked, like_id } = await isVerseLiked({ location, user_id })

  if (alreadyLiked && like_id !== null && like_id !== undefined) {
    await deleteLike({ location, user_id, like_id })
  } else {
    await createLike({ location, user_id })
  }
}