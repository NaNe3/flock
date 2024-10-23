import AsyncStorage from "@react-native-async-storage/async-storage";

export const getInitialSystemVariables = async () => {
  const firstLaunch = await AsyncStorage.getItem('alreadyLaunched')
  return { firstLaunch }
}

export const getLocallyStoredVariable = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value
  } catch (error) {
    console.log(`Error getting ${key} from local storage: ${error}`);
    return null
  }
}
