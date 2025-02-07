import AsyncStorage from "@react-native-async-storage/async-storage";

export const getInitialSystemVariables = async () => {
  const complete = await AsyncStorage.getItem('onboarding_complete')
  return { onboarded: complete === 'true' }
}

export const finishOnboarding = async () => { await AsyncStorage.setItem('onboarding_complete', 'true') }

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
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    console.error(`Error setting ${key} in local storage: ${error}`);
  }
};

export const setUserInformationInLocalStorage = async (userInformation) => {
  try {
    await AsyncStorage.setItem('user_information', JSON.stringify(userInformation))
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
  return await getAttributeFromObjectInLocalStorage("user_information", "id")
}

const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// REWRITE TO GET ONLY COME FOLLOW ME PLAN
export const checkIfUserHasStudiedPlanToday = async () => {
  try {
    const logs = JSON.parse(await AsyncStorage.getItem(`user_logs`))
    const day = getFormattedDate()

    const alreadyStudied = logs.some(log => log.created_at.includes(day))
    if (!alreadyStudied) {
      return false
    } else {
      return true
    }
  } catch (error) {
    console.log(`Error getting reading log from local storage: ${error}`);
    return false
  }
}

export const getLogsFromToday = async () => {
  try {
    const logs = JSON.parse(await AsyncStorage.getItem(`user_logs`))
    const day = getFormattedDate()
    console.log("day: ", day)

    return logs.filter(log => log.created_at.includes(day))
  } catch (error) {
    console.log(`Error getting reading log from local storage: ${error}`);
    return []
  }
}

export const getEmojiHistory = async () => {
  const history = await getLocallyStoredVariable('emoji_history')

  if (history) {
    return JSON.parse(history)
  } else {
    await setLocallyStoredVariable('emoji_history', JSON.stringify(['💛', '🔥']))
    return ['💛', '🔥']
  }
}

export const setEmojiHistory = async (emoji) => {
  const history = JSON.parse(await getLocallyStoredVariable('emoji_history'))
  const newHistory = history 
    ? history[1] === emoji
      ? history
      : [history[1], emoji] 
    : [emoji]
  await setLocallyStoredVariable('emoji_history', JSON.stringify(newHistory))
}