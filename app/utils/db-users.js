import supabase from "./supabase";

export const getUsersFromListOfPhoneNumbers = async (phoneNumbers) => {
  const { data: users, error } = await supabase
    .from('user')
    .select('id, phone_number')
    .in('phone_number', phoneNumbers)

  if (error) {
    throw new Error(error.message)
  }
  return users
}

export const updateUserNameById = async (userId, newName) => {
  const dissected = newName.split(' ')
  const firstName = dissected[0]
  const lastName = dissected.slice(1).join(' ')

  const { data, error } = await supabase
    .from('user')
    .update({ 
      full_name: newName,
      fname: firstName,
      lname: lastName,
    })
    .eq('id', userId)
    .select(`full_name, fname, lname`)

  if (error) {
    return { error: error.message }
  }
  return {
    data: data[0],
    error: null
  }
}

export const updateUserColorById = async (userId, colorId) => {
  const { data, error } = await supabase
    .from('user')
    .update({ color_id: colorId })
    .eq('id', userId)
    .select('color_id')

  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  return {
    color: data[0].color_id,
    error: null
  }
}

export const getImpressionCount = async (userId) => {
  const { count, error } = await supabase
    .from('activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('media_id', 'is', null)

  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  return count
}

export const getBookmarkCount = async (userId) => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  return count
}
