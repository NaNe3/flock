import { moveLocalFileToNewPath } from "./db-download";
import { getUserIdFromLocalStorage } from "./localStorage";
import supabase from "./supabase";

const prepareMediaForUpload = async (media, media_type) => {
  const response = await fetch(media)
  const arrayBuffer = await response.arrayBuffer()
  const fileName = media.split('/').pop()

  return { fileName, arrayBuffer }
}

const createMediaRow = async (media_type, media_path, duration) => {
  const { data, error } = await supabase
    .from('media')
    .insert(
      { media_type: media_type, media_path: media_path, duration: duration }
    )
    .select('media_id')

  if (error) {
    console.error('Error creating media row:', error)
    return { error: error }
  }

  return { media_id: data[0].media_id }
}

const createActivityRow = async (location, media_id, user_id, recipient_id) => {
  const { error } = await supabase
    .from('activity')
    .insert({
      work: location.work, 
      book: location.book,
      chapter: location.chapter,
      verse: location.verse,
      media_id: media_id,
      user_id: user_id,
      group_id: parseInt(recipient_id),
    })

  if (error) {
    console.error('Error creating activity row:', error)
    return { error: error }
  }

  return { error: null }
}

// export const uploadMedia = async (location, media, media_type) => {
//   if (!media) return null

//   if (media_type === 'picture') {
//     return await uploadPictureAsMedia(location, media)
//   } else if (media_type === 'video') {
//     return await uploadVideoAsMedia(media)
//   }
// }

export const uploadMedia = async ({ location, media, media_type, duration, recipient_id }) => {
  if (!media) return null

  try {
    const { fileName, arrayBuffer } = await prepareMediaForUpload(media, media_type)
    console.log("uploading media ", fileName)

    const config = {
      headers: {
        'Content-Type': media_type === 'picture' ? 'image/jpeg' : 'video/quicktime',
      },
    };

    const { data, error } = await supabase.storage
      .from('media')
      .upload(`public/${media_type}/${fileName}`, new Uint8Array(arrayBuffer), config)
    await moveLocalFileToNewPath({ oldPath: media, newPath: fileName })

    if (error) {
      console.error('Error uploading image:', error)
      return { error: error }
    } else {
      // CREATE MEDIA ROW
      const { media_id, error: createMediaError } = await createMediaRow(media_type, data.path, duration)

      // CREATE ACTIVITY ROW
      if (!createMediaError) {
        const user_id = await getUserIdFromLocalStorage()
        const { error: createActivityError } = await createActivityRow(location, media_id, user_id, recipient_id)

        if (!createActivityError) {
          await updateLastImpression({ user_id, recipient_id })
          return { status: 200 }
        } else {
          console.error('Error creating activity row:', createActivityError)
          return { error: createActivityError } 
        }
      } else {
        console.error('Error creating media row:', createMediaError)
        return { error: createMediaError }
      }
    }

    return { data: data }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { error: error }
  }
}

export const updateLastImpression = async ({ user_id, recipient_id }) => {
  try {
    console.log('updating last impression: ', user_id, recipient_id)
    if (recipient_id !== null) {
      const { data, error } = await supabase
        .from('group')
        .update({ last_impression: new Date() })
        .eq('group_id', recipient_id)

      if (error) {
        console.error('Error updating last impression:', error)
        return { error: error}
      }
    } else {
      const { data, error } = await supabase
        .from('user')
        .update({ last_impression: new Date() })
        .eq('id', user_id)

      if (error) {
        console.error('Error updating last impression:', error)
        return { error: error}
      }
    }
  } catch (error) {
    console.error('Error updating last impression:', error)
  }
}

// export const uploadVideoAsMedia = async (video) => {
//   if (!video) return null

//   try {
//     const { fileName, arrayBuffer } = await prepareMediaForUpload(video)
//     const { data, error } = await supabase.storage
//       .from('media')
//       .upload(`media/${video.name}`, video)

//     if (error) {
//       console.error('Error uploading video:', error)
//       return { error: error }
//     }

//     return { data: data }
//   } catch (error) {
//     console.error('Error uploading video:', error)
//     return { error: error }
//   }
// }


// media_id, sender_id, recipient_id, emoji
export const reactToMedia = async ({ emoji, activity_id, sender_id, recipient_id }) => {
  const { data, error } = await supabase
    .from('reaction')
    .insert([
      { 
        emoji: emoji, 
        activity_id: activity_id, 
        sender_user_id: sender_id, 
        recipient_user_id: recipient_id 
      }
    ])

  if (error) {
    console.error('Error reacting to media:', error)
    return { error: error }
  }

  return { error: null } 
}

export const getReactionsByActivityId = async (activity_id) => {
  const { data, error, count } = await supabase
    .from('reaction')
    .select(
      `
      reaction_id,
      emoji,
      sender_user_id ( id, full_name, avatar_path, color_id(color_hex))
      `,
      { count: 'exact' }
    )
    .eq('activity_id', activity_id)
    .order('reaction_id', { ascending: false }) // adjust if needed (e.g. order by created_at)
    .range(0, 2)  // gets the last three rows (based on this ordering)

  if (error) {
    console.error('Error getting reactions by activity id:', error)
    return { error: error }
  }

  return {
    count: count,
    reactions: data.map(reaction => {
      const { sender_user_id, ...other } = reaction
      const { color_id, ...user } = sender_user_id

      return {
        ...other,
        user: {
          ...user,
          color: color_id.color_hex
        }
      }
    })
  }
}

export const getReactionInformation = async (reaction_id) => {
  const { data, error } = await supabase
    .from('reaction')
    .select(`
      activity_id,
      sender_user_id ( id, full_name, avatar_path, color_id(color_hex))
    `)
    .eq('reaction_id', reaction_id)

  if (error) {
    console.error('Error getting reaction information:', error)
    return { error: error }
  }

  const { id, full_name, avatar_path, color_id } = data[0].sender_user_id

  return {
    id: id,
    full_name: full_name,
    avatar_path: avatar_path,
    color: color_id.color_hex,
    activity_id: data[0].activity_id
  }
}

export const getLocationOfActivity = async (activity_id) => {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      work,
      book,
      chapter,
      verse
    `)
    .eq('activity_id', activity_id)

  if (error) {
    console.error('Error getting location of media:', error)
    return { error: error }
  }

  return { work: data[0].work, book: data[0].book, chapter: data[0].chapter, verse: data[0].verse }
}