import AsyncStorage from "@react-native-async-storage/async-storage";

export const getInitialSystemVariables = async () => {
  // CHECK IF ALREADY LAUNCHED, RETURN VALUE
  const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched')
  let firstLaunch = true
  if (alreadyLaunched !== null && alreadyLaunched !== undefined && alreadyLaunched !== false) {
    firstLaunch = false
  }

  return { firstLaunch }
}

export const finishOnboarding = async () => { await AsyncStorage.setItem('alreadyLaunched', 'true') }

export const getLocallyStoredVariable = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key)
    return value
  } catch (error) {
    console.log(`Error getting ${key} from local storage: ${error}`)
    return null
  }
}

export const setLocallyStoredVariable = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in local storage: ${error}`);
  }
};

export const setUserInformationInLocalStorage = async ({ id, uui, created_at, email, fname, lname, goal, phone_number, plan, avatar_path, last_active }) => {
  const userDataTemplate = {
    id,
    uui,
    created_at,
    phone_number,
    email,
    avatar_path,
    last_active,
    fname,
    lname,
    goal,
    plan,
  }

  try {
    await AsyncStorage.setItem('userInformation', JSON.stringify(userDataTemplate))
  } catch (e) {
    console.error(`Error setting user information in local storage: ${e}`)
    return { error: e }
  }
}

export const setAttributeForObjectInLocalStorage = async (object, key, newValue) => {
  try {
    const storedValue = await AsyncStorage.getItem(object);
    if (storedValue !== null) {
      let parsedValue = JSON.parse(storedValue)
      parsedValue[key] = newValue
      await AsyncStorage.setItem(object, JSON.stringify(parsedValue))
    }
  } catch (error) {
    console.log(`Error setting ${key} for ${object} in local storage: ${error}`);
    return { error }
  }
}

export const getAttributeFromObjectInLocalStorage = async (object, keys) => {
  try {
    const value = await AsyncStorage.getItem(object);
    if (value !== null) {
      const parsedValue = JSON.parse(value)
      if (Array.isArray(keys)) {
        return keys.map(k => parsedValue[k])
      } else {
        return parsedValue[keys]
      }
    }
  } catch (error) {
    console.log(`Error getting ${keys} from local storage: ${error}`);
    return null
  }
}

export const getUserIdFromLocalStorage = async () => {
  return await getAttributeFromObjectInLocalStorage("userInformation", "id")
}
