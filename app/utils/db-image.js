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

export const leaveGroupByGroupId = async (groupId, userId, newLeader) => {
  try {
    // 1 - delete group_member relationship
    const { error } = await supabase
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    // 2 - if newLeader is not null, create new leader
    if (!error) {
      if (newLeader !== null) {
        const { error: newLeaderError } = await supabase
          .from('group_member')
          .update({ is_leader: true })
          .eq('group_id', groupId)
          .eq('user_id', newLeader)

        if (newLeaderError) {
          console.error('Error updating new leader:', newLeaderError)
          return { error: newLeaderError }
        }

        return { error: null }
      } else {
        return { error: null }
      }
    } else {
      console.log('Error leaving group (supa):', error)
      return { error: error }
    }
  } catch (error) {
    console.error('Error leaving group:', error)
    return { error: error }
  }
}

export const removeGroupMember = async (groupId, userId) => {
  try {
    const { error } = await supabase
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing group member:', error)
      return { error: error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error removing group member:', error)
    return { error: error }
  }
}

export const addGroupMembers = async (groupId, members) => {
  try {
    const rowsToAdd = members.map((member) => {
      return {
        group_id: groupId,
        user_id: member.id,
        is_leader: false,
        status: 'pending',
      }
    })

    const { data, error } = await supabase
      .from('group_member')
      .insert(rowsToAdd)
      .select(`
        group_id,
        user_id,
        is_leader,
        status,
        group (group_name, group_image, plan_id),
        user (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex))
      `)

    if (error) {
      console.error('Error adding group members:', error)
      return { error: error }
    }

    return { data: data.map(member => {
      const { color_id, ...groupMember } = member.user

      return {
        ...groupMember,
        is_leader: member.is_leader, 
        status: member.status,
        last_studied: member.user.last_studied ? member.user.last_studied.created_at : null,
        color: color_id.color_hex
      }
    }), error: null }
  } catch (error) {
    console.error('Error adding group members:', error)
    return { error: error }
  }
}

export const removeGroupMembers = async (groupId, members) => {
  try {
    const { error } = await supabase
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .in('user_id', members.map(member => member.id))

    if (error) {
      console.error('Error removing group members:', error)
      return { error: error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error removing group members:', error)
    return { error: error }
  }
}