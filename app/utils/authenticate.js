import { formatActivityFromSupabase } from './format';
import { getLocallyStoredVariable, setUserInformationInLocalStorage } from './localStorage';
import supabase from './supabase'

export const initSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session
}

export const removeUserSession = async () => { await supabase.auth.signOut() }

export const setUserInformationFromUUID = async (uuid) => {
  try {
    const userInformation = await getUserInformationFromUUID(uuid)
    await setUserInformationInLocalStorage(userInformation)
  } catch (error) {
    console.log(`Error setting user information from UUID: ${error}`)
    return { error }
  }
}

export const getUserInformationFromUUID = async (uuid) => {
  const { data, error } = await supabase
    .from('user')
    .select(`
      id, fname, lname, avatar_path, email, plan_id, current_streak,
      color_id(color_id, color_name, color_hex),
      last_studied(created_at)
    `)
    .eq('uui', uuid)

  if (error) {
    console.error(error)
    return error
  }

  if (data.length !== 0) {
    const {color_id, last_studied, ...user } = data[0]
    return {
      ...user,
      last_studied: last_studied ? last_studied.created_at : null,
      color: color_id,
    }
  } else {
    return null
  }
}

export const createUserThroughAppleAuthentication = async (credential, uui) => {
  // const {
  //   error,
  //   data: { user },
  // } = await supabase.auth.signInWithIdToken({
  //   provider: 'apple',
  //   token: credential.identityToken,
  // })

  // if (!error) {
  const { givenName, familyName } = credential.fullName
  const { email } = credential
  
  return await upsertUser(uui, givenName, familyName, email)
  // } else {
  //   return { error: error }
  // }
}

export const signInUserThroughAppleAuthentication = async (credential) => {
  const {
    error,
    data: { user },
  } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  })

  const uuid = user.id
  const userInformation = await getUserInformationFromUUID(uuid)

  if (userInformation === null) {
    // if user does not exist, create a new user and instruct client to continue with onboarding
    const result = await createUserThroughAppleAuthentication(credential, uuid)
    return { data: result, next: 'onboard' }
  } else {
    // if user does not ahve a profile picture set, continue with the onboarding.
    // if profile picture is set, continue with the sign-in process
    return { data: userInformation, next: userInformation.avatar_path === null ? 'onboard' : 'signin' }
  }
}

export const upsertUser = async (uui, fname, lname, email) => {
  const { data: userData, error } = await supabase
    .from('user')
    .upsert({
      "uui": uui,
      "fname": fname,
      "lname": lname,
      "full_name": `${fname} ${lname}`,
      "email": email,
      "goal": null,
      "plan_id": 1,
      "color_id": 1,
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
      user()
    `)
    .eq('work', work)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('user_id', user_id)
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

async function getFriendIds() {
  return JSON.parse(await getLocallyStoredVariable('user_friends'))
    .filter(friend => friend.status === 'accepted')
    .map(friend => parseInt(friend.id))
}

async function getGroupIds() {
  return JSON.parse(await getLocallyStoredVariable('user_groups'))
    .map(group => parseInt(group.group_id))
}

export const getMediaFromVerse = async (work, book, chapter, verse, userId) => {
  const friendIds = await getFriendIds()
  const groupIds = await getGroupIds()

  const { data, error } = await supabase
    .from('activity')
    .select(`
      verse,
      user(id, fname, lname, avatar_path, color_id(color_hex)),
      media(created_at, media_id, media_type, media_path),
      group(group_image, group_name)
    `)
    .eq('work', work)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .not('media_id', 'is', null)
    .or(`user_id.eq.${userId},user_id.in.(${friendIds.join(',')}),group_id.in.(${groupIds.join(',')})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return { error: error }
  }

  return data.map(media => {
    const { user, ...newMedia} = media
    const { color_id, ...newUser } = user
    return {
      ...newMedia,
      user: {
        ...newUser,
        color: color_id.color_hex,
      }
    }
  })
}

export const getVersesWithActivity = async (work, book, chapter, userId) => {
  try {
    const friendIds = await getFriendIds()
    const groupIds = await getGroupIds()

    const { data, error } = await supabase
      .from('activity')
      .select(`
        activity_id,
        verse,
        user(color_id(color_hex))
      `)
      .eq('work', work)
      .eq('book', book)
      .eq('chapter', chapter)
      .not('media_id', 'is', null)
      .or(`user_id.eq.${userId},user_id.in.(${friendIds.join(',')}),group_id.in.(${groupIds.join(',')})`)

    if (error) {
      console.error(error)
      return { error: error }
    }

    const activity = formatActivityFromSupabase(data)
    return activity
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

export const searchForUsersByText = async (userId, text) => {
  const name = text.split(' ')
  const { data, error } = await supabase
    .from('user')
    .select(`
      id,
      fname, 
      lname,
      avatar_path,
      last_studied(created_at),
      color_id(color_hex)
    `)
    .neq('id', userId)
    .ilike('full_name', `%${text}%`)
    .limit(15)

  if (error) {
    console.error(error)
    return { error: error }
  }

  return data.map(user => {
    const { color_id, ...userData } = user
    const lastStudied = user.last_studied ? user.last_studied.created_at : null
    return {
      ...userData,
      last_studied: lastStudied,
      color: color_id.color_hex
    }
  })
}

const updateLastStudiedLog = async (userId, log_id) => {
  const { error } = await supabase
    .from('user')
    .update({ last_studied: log_id })
    .eq('id', userId)

  if (error) {
    console.error(error)
    return { error }
  }
}

export const updateUserStreak = async (userId) => {
  const { data, error } = await supabase
    .from('user')
    .select('current_streak')
    .eq('id', userId)

  const currentStreak = data[0].current_streak

  if (!error) {
    const { error: streakError } = await supabase
      .from('user')
      .update({ current_streak: currentStreak + 1 })
      .eq('id', userId)

    if (streakError) {
      console.log('error updating streak: ', streakError)
    }
  }
}

export const createReadingLog = async (userId, plan_id) => {
  const { data, error } = await supabase
    .from('log')
    .insert({
      user_id: userId,
      plan_id: plan_id,
    })
    .select()

  if (error) {
    console.error(error)
    return { error }
  } else {
    await updateLastStudiedLog(userId, data[0].log_id)
    await updateUserStreak(userId)
  }

  return { data: data[0] }
}

export const getLogsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('log')
    .select()
    .eq('user_id', userId)

  if (error) {
    console.error(error)
    return { error }
  }

  return { data }
}

export const updateUserColorAfterAccountCreation = async (colorId, userId) => {
  const { data, error } = await supabase
    .from('user')
    .update({ color_id: colorId })
    .eq('id', userId)
    .select(`
      id, fname, lname, avatar_path, email, plan_id, current_streak,
      color_id(color_id, color_name, color_hex),
      last_studied(created_at)
    `)
  if (error) {
    console.error(error)
    return { error }
  }

  const { color_id, ...user } = data[0]
  return { data: {
    ...user,
    last_studied: user.last_studied ? user.last_studied.created_at : null,
    color: color_id,
  }}
}