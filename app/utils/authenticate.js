import supabase from './supabase'

export const initSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session
}

export const getUserInformationFromUUID = async (uuid) => {
  const { data, error } = await supabase
    .from('user')
    .select('id, uui, created_at, email, fname, lname, goal, phone_number, plan_id, avatar_path, last_active')
    .eq('uui', uuid)

  if (error) {
    console.error(error)
    return error
  }

  return data[0]
}

export const createUserThroughAppleAuthentication = async (credential, phone) => {
  const {
    error,
    data: { user },
  } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  })

  if (!error) {
    const { givenName, familyName } = credential.fullName
    const { email } = credential
    const uui = user?.id
    
    return await upsertUser(uui, givenName, familyName, email, phone)
  } else {
    return { error: error }
  }
}

export const upsertUser = async (uui, fname, lname, email, phone) => {
  const { data: userData, error } = await supabase
    .from('user')
    .upsert({
      "uui": uui,
      "fname": fname,
      "lname": lname,
      "email": email,
      "phone_number": phone,
      "goal": null,
      "plan": null,
    }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error(error)
    return error
  }

  return userData[0]
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

export const getAllVersesWithLikesInChapter = async (work, book, chapter, user_id) => {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      user_id,
      verse,
      user(avatar_path)
    `)
    .eq('work', work)
    .eq('book', book)
    .eq('chapter', chapter)
    .not('like_id', 'is', null)

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

export const getMediaFromVerse = async (work, book, chapter, verse) => {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      verse,
      user(id, fname, lname, avatar_path),
      media(created_at, media_id, media_type, media_path)
    `)
    .eq('work', work)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .not('media_id', 'is', null)

  if (error) {
    console.error(error)
    return { error: error }
  }

  return data
}

export const getVersesWithActivity = async (work, book, chapter, userId) => {
  try {
    const { data, error } = await supabase
      .from('activity')
      .select(`verse`)
      .eq('work', work)
      .eq('book', book)
      .eq('chapter', chapter)
      .not('media_id', 'is', null)
      // .neq('user_id', userId)
      // TODO - activity of others, not user

    if (error) {
      console.error(error)
      return { error: error }
    }
    return data
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getMediaFromChapter = async (work, book, chapter) => {
  try {
    const { data, error } = await supabase
      .from('activity')
      .select(`
        verse,
        user(id, fname, lname, avatar_path),
        media(created_at, media_id, media_type, media_path)
      `)
      .eq('work', work)
      .eq('book', book)
      .eq('chapter', chapter)
      .not('media_id', 'is', null)

    if (error) {
      console.error(error)
      return { error: error }
    }

    return data
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getPlanByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select(`
        plan (plan_name, plan_info)
      `)
      .eq('id', userId)

    if (error) {
      console.error(error)
      return { error: error }
    }

    return data[0]
  } catch (error) {
    console.error(error)
    return { error: error }
  }
}