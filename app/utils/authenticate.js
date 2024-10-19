import supabase from './supabase'

export const upsertUserWithName = async (name, goal) => {
  const { data, error } = await supabase
    .from('user')
    .select('name')
    .eq('name', name)

  if (error) {
    console.error(error)
    return error
  }

  if (data.length === 0) {
    const { data: userData, error } = await supabase
      .from('user')
      .insert([{ name, goal: parseInt(goal) }])
      .select()

    if (error) {
      console.error(error)
      return error
    }

    return userData[0]
  } else {
    return data[0]
  }
}

const doesTheVerseExist = async (book, chapter, verse) => {
  const { data, error } = await supabase
    .from('likes')
    .select()
    .eq('location', `${book}-${chapter}`)
    .eq('verse', verse)

  if (error) {
    console.error(error)
    return error
  }

  return data.length > 0
}

export const doesTheUserLikeTheVerse = async (userId, book, chapter, verse) => {
  const verseExists = await doesTheVerseExist(book, chapter, verse)

  if (!verseExists) {
    likeVerse(userId, book, chapter, verse)
  } else {
    const { data, error } = await supabase
      .from('likes')
      .select('people')
      .eq('location', `${book}-${chapter}`)
      .eq('verse', verse)

    if (!data) {
      return false
    } 

    if (data.length === 0) {
      return false
    } else {
      // LIKE ROW EXISTS AND IS LOOKING FOR USER
      const peopleWhoLikedVerse = JSON.parse(data[0].people)
      const userLikesVerse = peopleWhoLikedVerse.some(person => person === userId)
      
      if (userLikesVerse) {
        // UNLIKE THE VERSE
        const newPeople = JSON.stringify(JSON.parse(data[0].people).filter(person => person !== userId))
        changeLikesOfExistingVerse(book, chapter, verse, newPeople)
      } else {
        // LIKE THE VERSE
        const newPeople = JSON.stringify([...peopleWhoLikedVerse, userId])
        changeLikesOfExistingVerse(book, chapter, verse, newPeople)
      }
    }
  }
}

const changeLikesOfExistingVerse = async (book, chapter, verse, newPeople) => {
  const { error } = await supabase
    .from('likes')
    .update({ people: newPeople })
    .eq('location', `${book}-${chapter}`)
    .eq('verse', verse)

  if (error) {
    console.error(error)
    return error
  }
}

export const likeVerse = async (userId, book, chapter, verse) => {
  const { error } = await supabase
    .from('likes')
    .upsert([{ 
      location: `${book}-${chapter}`, 
      verse: verse, 
      people: [userId] 
    }])
  
  if (error) {
    console.error(error)
    return error
  }
}

export const getAllVersesWithLikesInChapter = async (book, chapter) => {
  const { data, error } = await supabase
    .from('likes')
    .select()
    .eq('location', `${book}-${chapter}`)

  if (error) {
    console.error(error)
    return error
  }

  if (data.length === 0) {
    return []
  } else {
    return data
  }
}

export const getNamesFromListOfIds = async (ids) => {
  const { data, error } = await supabase
    .from('user')
    .select('name, id')
    .in('id', ids)

  if (error) {
    console.error(error)
    return error
  }

  return data
}

export const getCommentsForVerse = async (book, chapter, verse) => {
  const { data, error } = await supabase
    .from('comments')
    .select()
    .eq('location', `${book}-${chapter}`)
    .eq('verse', verse)

  if (error) {
    console.error(error)
    return error
  }

  return data
}

export const postComment = async (userId, comment, book, chapter, verse) => {
  const { error } = await supabase
    .from('comments')
    .insert([{ 
      location: `${book}-${chapter}`, 
      verse: verse, 
      comment: comment,
      user_id: userId,
    }])

  if (error) {
    console.error(error)
    return error
  }

  return getCommentsForVerse(book, chapter, verse)
}

export const createRealtimeConnection = async (onLikesChange, onCommentsChange) => {
  supabase.channel('realtime:rue')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, onLikesChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'likes' }, onLikesChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, onCommentsChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, onCommentsChange)
    .subscribe()
}

export const getCommentsFromChapter = async (book, chapter) => {
  const { data, error } = await supabase
    .from('comments')
    .select()
    .eq('location', `${book}-${chapter}`)

  if (error) {
    console.error(error)
    return error
  }

  return data
}