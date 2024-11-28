import supabase from "./supabase"

export const invokeLikeVerse = async (work, book, chapter, verse, user_id) => {
  const { data, error } = await supabase.functions.invoke('like-verse', {
    body: { work, book, chapter, verse, user_id }
  })

  if (error) {
    console.log("Error invoking like-verse", error)
  }
}