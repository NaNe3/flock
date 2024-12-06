import { moveLocalFileToNewPath } from "./db-download";
import { getUserIdFromLocalStorage } from "./localStorage";
import supabase from "./supabase";

const prepareMediaForUpload = async (media, media_type) => {
  const response = await fetch(media)
  const arrayBuffer = await response.arrayBuffer()
  const fileName = media.split('/').pop()

  return { fileName, arrayBuffer }
}

const createMediaRow = async (media_type, media_path) => {
  const { data, error } = await supabase
    .from('media')
    .insert(
      { media_type: media_type, media_path: media_path }
    )
    .select('media_id')

  if (error) {
    console.error('Error creating media row:', error)
    return { error: error }
  }

  return { media_id: data[0].media_id }
}

const createActivityRow = async (location, media_id, user_id) => {
  const { error } = await supabase
    .from('activity')
    .insert({ 
      work: location.work, 
      book: location.book,
      chapter: location.chapter, 
      verse: location.verse, 
      media_id: media_id, 
      user_id: user_id 
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

export const uploadMedia = async (location, media, media_type) => {
  if (!media) return null

  try {
    const { fileName, arrayBuffer } = await prepareMediaForUpload(media, media_type)
    const { data, error } = await supabase.storage
      .from('media')
      .upload(`public/${media_type}/${fileName}`, new Uint8Array(arrayBuffer), {
        contentType: media_type === 'picture' ? 'image/jpeg' : 'video/quicktime',
      })
    await moveLocalFileToNewPath({ oldPath: media, newPath: fileName })

    if (error) {
      console.error('Error uploading image:', error)
      return { error: error }
    } else {
      // CREATE MEDIA ROW
      const { media_id, error: createMediaError } = await createMediaRow(media_type, data.path)

      // CREATE ACTIVITY ROW
      if (!createMediaError) {
        const user_id = await getUserIdFromLocalStorage()
        const { error: createActivityError } = await createActivityRow(location, media_id, user_id)

        if (!createActivityError) {
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