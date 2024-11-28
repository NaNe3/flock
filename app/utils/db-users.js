import supabase from "./supabase";

export const getUsersFromListOfPhoneNumbers = async (phoneNumbers) => {
  const { data: users, error } = await supabase
    .from('user')
    .select('phone_number')
    .in('phone_number', phoneNumbers)

  if (error) {
    throw new Error(error.message)
  }
  return users
}