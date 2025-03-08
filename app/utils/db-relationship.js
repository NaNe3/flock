import { formatFriendsFromSupabase } from "./format";
import { setLocallyStoredVariable } from "./localStorage";
import supabase from "./supabase";

export const createRelationship = async (user_id, friend_id) => {
  try {
    const { data, error } = await supabase
      .from("relationship")
      .insert([
        { 
          user_one: user_id, 
          user_two: friend_id, 
          invited_by: user_id,
          type: "friend" 
        }, 
      ])
      .select(`
        user_two (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex))
      `)

    
    if (error) {
      console.error("Error creating relationship:", error);
      return { error: error };
    } else {
      const { color_id, ...user } = data[0].user_two

      return { error: null, data: {
        ...user,
        invited_by: user_id,
        last_studied: user.last_studied ? user.last_studied.created_at : null,
        color: color_id.color_hex
      }}
    }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const removeRelationship = async (user_id, friend_id) => {
  try {
    const { data, error } = await supabase
      .from('relationship')
      .delete()
      .or(`and(user_one.eq.${user_id},user_two.eq.${friend_id}),and(user_one.eq.${friend_id},user_two.eq.${user_id})`);

    if (error) {
      console.error("Error removing relationship:", error);
      return { error: error };
    } else {
      return { error: null }
    }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const getRelationships = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('relationship')
      .select(`
        status, invited_by, created_at,
        user_two (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex), last_impression),
        user_one (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex), last_impression)
      `)
      .or(`user_one.eq.${user_id},user_two.eq.${user_id}`)

    if (error) {
      console.error("Error getting relationships:", error);
      return { error: error }
    }

    const relationships = formatFriendsFromSupabase(data, user_id)
    return { data: relationships, error: null }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const getFriendRequestsByUserId = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('relationship')
      .select(`
        user_one (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex)),
        created_at
      `)
      .eq('user_two', user_id)
      .eq('status', 'pending')

    if (error) {
      console.error("Error getting friend requests:", error);
      return { error: error };
    }

    const friendRequests = data.map(item => {
      const { color_id, ...user} = item.user_one

      return {
        ...user,
        last_studied: user.last_studied ? user.last_studied.created_at : null,
        created_at: item.created_at,
        color: color_id.color_hex
      }
    })
    return { data: friendRequests, error: null }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const resolveFriendRequest = async (user_id, friend_id, action) => {
  const { data, error } = await supabase
    .from('relationship')
    .update({ status: action })
    .eq('user_one', friend_id)
    .eq('user_two', user_id)

  if (error) {
    console.error("Error accepting friend request:", error);
    return { error: error };
  }

  return { data }
}

const organizeGroupData = (user_id, data) => {
  const groupedData = data.reduce((acc, item) => {
    const groupId = item.group_id
    if (!acc[groupId]) {
      acc[groupId] = {
        members: [],
        ...item.group
      }
    }
    
    const { color_id, ...user } = item.user
    acc[groupId].members.push({
      ...user,
      is_leader: item.is_leader, 
      status: item.status,
      created_at: item.created_at,
      last_studied: item.user.last_studied ? item.user.last_studied.created_at : null,
      color: color_id.color_hex
    })
    return acc
  }, {})

  return Object.entries(groupedData).map(([group_id, groupData]) => ({
    group_id,
    ...groupData
  }))
}

export const getGroupsForUser = async (user_id) => {
  try {
    const { data: userGroupsData, error: userGroupsError } = await supabase
      .from('group_member')
      .select('group_id')
      .eq('user_id', user_id)
      .neq('status', 'rejected')

    if (userGroupsError) {
      console.error("Error getting groups for user:", error);
      return { error: error };
    }

    const groupIds = userGroupsData.map(group => group.group_id)

    const { data, error } = await supabase
      .from('group_member')
      .select(`
        group_id, user_id, is_leader, status,
        group (group_name, group_image, last_impression, plan_id, created_at),
        user (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex))
      `)
      .in('group_id', groupIds)

    const groupedData = organizeGroupData(user_id, data)
    return { data: groupedData, error: null }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const acceptGroupInvitation = async (user_id, group_id) => {
  const { error } = await supabase
    .from('group_member')
    .update({ status: 'accepted' })
    .eq('user_id', user_id)
    .eq('group_id', group_id)

  if (error) {
    console.error("Error accepting group invitation:", error);
    return { error: error };
  } else {
    const { data: groupsData, error: groupsError } = await getGroupsForUser(user_id);

    if (groupsError) {
      console.error("Error getting groups for user:", groupsError);
      return { error: groupsError };
    }
    try {
      await setLocallyStoredVariable('user_groups', JSON.stringify(groupsData));
    } catch (e) {
      console.error("Error setting user groups in local storage:", e);
      return { error: e };
    }
  }

  return { data }
}

export const rejectGroupInvitation = async (user_id, group_id) => {
  const { data, error } = await supabase
    .from('group_member')
    .update({ status: 'rejected' })
    .eq('user_id', user_id)
    .eq('group_id', group_id)

  if (error) {
    console.error("Error rejecting group invitation:", error);
    return { error: error };
  }

  return { data }
}

export const getSenderInformation = async (user_id, sender_id) => {
  try {
    const { data, error } = await supabase
      .from('relationship')
      .select(`
        user_one (id, fname, lname, avatar_path, last_studied(created_at), color_id(color_hex)),
        created_at
      `)
      .eq('user_one', sender_id)
      .eq('user_two', user_id)

    if (error) {
      console.error("Error getting friend requests:", error);
      return { error: error };
    }


    const { color_id, ...user} = data[0].user_one
    const friendRequest = {
      ...user,
      last_studied: user.last_studied ? user.last_studied.created_at : null,
      created_at: data[0].created_at,
      color: color_id.color_hex
    }
    return { data: friendRequest, error: null }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
}

export const getInfoFromGroupMember = async (group_member_id) => {
  const { data, error } = await supabase
    .from('group_member')
    .select(`
      group (group_name, group_image),
      user (id, full_name, avatar_path, last_studied(created_at), color_id(color_hex))
    `)
    .eq('group_member_id', group_member_id)

  if (error) {
    console.error("Error getting group member information:", error);
    return { error: error };
  }

  const { color_id, ...user } = data[0].user
  const groupMember = {
    ...user,
    last_studied: user.last_studied ? user.last_studied.created_at : null,
    color: color_id.color_hex,
    group: data[0].group
  }
  return groupMember
}