import { downloadFileWithPath } from "./db-download";
import supabase from "./supabase"
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// export const getAuthenticated = async () => {
//   const { data: { user }, error } = await supabase.auth.getUser();
//   if (error || !user) {
//     throw new Error('Not authenticated');
//   }
//   console.log(user);
//   return user;
// }


const prepImageForUpload = async (image, height, width) => {
  const resizedImage = await manipulateAsync(
    image, 
    [{ resize: { width: 200, height: 200 } }], 
    { format: SaveFormat.JPEG }
  )

  const response = await fetch(resizedImage.uri)
  const arrayBuffer = await response.arrayBuffer();
  const fileName = image.split('/').pop();

  return { fileName, arrayBuffer }
}

const uploadImage = async (path, fileName, arrayBuffer) => {
  const { data, error } = await supabase
    .storage
    .from('avatars')
    .upload(`${path}${fileName}`, new Uint8Array(arrayBuffer), {
      contentType: 'image/jpeg',
    })

  return { data, error }
}

export const uploadAvatar = async (image, user_id) => {
  if (!image) {
    console.error('No image provided');
    return;
  }

  try {
    const { fileName, arrayBuffer } = await prepImageForUpload(image, 200, 200);
    const { data, error } = await uploadImage('public/profile/', fileName, arrayBuffer);

    if (error) {
      console.error('Error uploading image:', error)
      return { error: error }
    } else {
      console.log('Image uploaded successfully:', data)

      const { error: updateTableError } = await updateAvatarForUser(data.path, user_id)
      if (updateTableError) {
        console.error('Error updating avatar for user:', updateTableError)
        return { error: updateTableError }
      }

      return { data: data }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    return { error: error }
  }
}

const updateAvatarForUser = async (avatar_path, user_id) => {
  const { error } = await supabase
    .from("user")
    .update({ avatar_path: avatar_path })
    .eq("id", user_id);

    if (error) {
      console.error('Error updating avatar for user:', error)
      return { error: error }
    }

    return { error: false }
}

const uploadGroupImage = async (image) => {
  if (!image) {
    console.error('No image provided')
    return
  }

  try {
    const { fileName, arrayBuffer } = await prepImageForUpload(image, 200, 200)
    const { data, error } = await uploadImage('public/group/', fileName, arrayBuffer)

    if (error) {
      console.error('Error uploading image:', error)
      return { error: error }
    } else {
      console.log('Image uploaded successfully:', data)

      return { data: data }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    return { error: error }
  }
}

const createGroupRow = async (name, image, plan) => {
  const { data, error } = await supabase
    .from('group')
    .insert({
      group_name: name,
      group_image: image,
      plan_id: plan,
    })
    .select("group_id")

  if (error) {
    console.error('Error creating group row:', error)
    return { error: error }
  }

  return { groupData: data }
}

const createGroupMemberRelationships = async (group_id, leader, members) => {
  try {
    const rowsToAdd = [
      {
        group_id: group_id,
        user_id: leader,
        is_leader: true,
      },
      ...members.map((member) => {
        return {
          group_id: group_id,
          user_id: member.id,
          is_leader: false,
        }
      })
    ]

    const { error } = await supabase
      .from('group_member')
      .insert(rowsToAdd)

    if (error) {
      console.error('Error creating group member relationships:', error)
      return { error: error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error creating group member relationships:', error)
    return { error: error }
  }
}

export const createGroup = async (name, image, leader = 9, members, plan) => {
  try {
    const { data, error } = await uploadGroupImage(image)
    const { error: avatarDownloadError } = await downloadFileWithPath('avatars', 'public/group/', data.path.split("/").pop())

    if (data && !error && !avatarDownloadError) {
      const { groupData } = await createGroupRow(name, data.path, plan)
    
      if (groupData) {
        const { error: groupMemberError } = await createGroupMemberRelationships(groupData[0].group_id, leader, members)
        if (groupMemberError) {
          return { error: groupMemberError }
        }
      }
      return { data: "Group created successfully", error: null }
    } else {
      return { error: error }
    }

  } catch (error) {
    console.error('Error creating group:', error)
    return { error: error }
  }
}
