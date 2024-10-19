import AsyncStorage from "@react-native-async-storage/async-storage";

export const getLocallyStoredVariable = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value
  } catch (error) {
    console.log(error);
    return null
  }
}