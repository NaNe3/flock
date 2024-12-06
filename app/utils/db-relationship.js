import { setLocallyStoredVariable } from "./localStorage";
import supabase from "./supabase";

export const createRelationship = async (user_id, friend_id) => {
  const { data, error } = await supabase
    .from("relationship")
    .insert([
      { user_one: user_id, user_two: friend_id, type: "friend", }, 
      { user_one: friend_id, user_two: user_id, type: "friend", }
    ])
    .select()

  if (error) {
    console.error("Error creating relationship:", error);
    return { error: error };
  }
}

export const getRelationships = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('relationship')
      .select(`
        user_two (id, fname, lname, avatar_path)
      `)
      .or(`user_one.eq.${user_id}`)

    if (error) {
      console.error("Error getting relationships:", error);
      return { error: error };
    }

    const relationships = data.map(item => item.user_two)
    return { data: relationships, error: null }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`)
    return { error: error }
  }
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
    acc[groupId].members.push({
      ...item.user, 
      is_leader: item.is_leader, 
      status: item.status
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
        group_id,
        user_id,
        is_leader,
        status,
        group (group_name, group_image, plan_id),
        user (id, fname, lname, avatar_path)
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