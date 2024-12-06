import { deleteLocalFileWithPath, downloadFileWithPath, moveLocalFileToNewPath } from "./db-download"
import { getLocallyStoredVariable, setLocallyStoredVariable } from "./localStorage"
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

const deleteImage = async (path) => {
  const { data, error } = await supabase
  .storage
  .from('avatars')
  .remove([path])

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
    await moveLocalFileToNewPath({ oldPath: image, newPath: fileName })

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
    await moveLocalFileToNewPath({ oldPath: image, newPath: fileName })

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
        status: 'accepted',
      },
      ...members.map((member) => {
        return {
          group_id: group_id,
          user_id: member.id,
          is_leader: false,
          status: 'pending',
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
      return { status: "ok"}
    } else {
      return { error: error }
    }

  } catch (error) {
    console.error('Error creating group:', error)
    return { error: error }
  }
}

export const updateGroupAvatar = async ({ groupId, oldImage, newImage }) => {
  const oldImageFormatted = `public/group/${oldImage.split("/").pop()}`
  // 1 - upload image to bucket
  const { data: uploadData, error: uploadError } = await uploadGroupImage(newImage)

  if (!uploadError) {
    // 2 - delete old image on server
    const { error: deleteError } = await deleteImage(oldImageFormatted)

    if (!deleteError) {
      // 3 - delete old image in local area
      const { error: deleteLocalError } = await deleteLocalFileWithPath(oldImage)

      if (!deleteError && !deleteLocalError) {
        // 4 - update path in group table
        const { error } = await supabase
          .from('group')
          .update({ group_image: uploadData.path })
          .eq('group_id', groupId)

        if (error) {
          console.error('Error updating group avatar:', error)
          return { error: error }
        }
      }
    }
  }

  // 5 - change group avatar in group local storage
  const userGroups = JSON.parse(await getLocallyStoredVariable('user_groups'))
  const newUserGroups = userGroups.map(group => {
    if (group.group_id === groupId) {
      return { ...group, group_image: uploadData.path }
    }
    return group
  })
  await setLocallyStoredVariable('user_groups', JSON.stringify(newUserGroups))

  return { error: null }
}

export const updateGroupName = async ({ groupId, groupName }) => {
  // 1 - update group name in group table
  const { error } = await supabase
    .from('group')
    .update({ group_name: groupName })
    .eq('group_id', groupId)

  if (error) {
    console.error('Error updating group name:', error)
    return { error: error }
  }

  // 2 - change group name in group local storage
  try {
    const userGroups = JSON.parse(await getLocallyStoredVariable('user_groups'))
    const newUserGroups = userGroups.map(group => {
      if (group.group_id === groupId) {
        return { ...group, group_name: groupName }
      }
      return group
    })
    await setLocallyStoredVariable('user_groups', JSON.stringify(newUserGroups))
  } catch (error) {
    console.log(error)
  }

  return { error: null }
}

export const deleteGroupByGroupId = async (groupId, groupAvatar) => {
  try {
    // 1 - delete group_members
    const { error: groupMemberError } = await supabase
      .from('group_member')
      .delete()
      .eq('group_id', groupId)

    // 2 - delete group
    const { error: groupError } = await supabase
      .from('group')
      .delete()
      .eq('group_id', groupId)

    if (!groupError && !groupMemberError) {
      // 3 - delete group image from bucket
      const { error: deleteImageError } = await deleteImage(`public/group/${groupAvatar.split("/").pop()}`)

      if (!deleteImageError) {
        // 4 - delete group image from system
        const { error: deleteLocalError } = await deleteLocalFileWithPath(groupAvatar)
      }

      // 5 - delete group from local storage
      const userGroups = JSON.parse(await getLocallyStoredVariable('user_groups'))
      const newGroups = userGroups.filter(group => group.group_id !== groupId)
      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
      return { error: null }
    }
  } catch (error) {
    console.error('Error deleting group:', error)
    return { error: error }
  }
}