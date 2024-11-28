import supabase from "./supabase"
import * as FileSystem from 'expo-file-system'

// TO DO LIST HERE
// 1. PUT ALL FILE ALLOCATION FUNCTIONS IN THIS FILE
// 2. MOVE ALL STORAGE FUCNTIONS TO ANOTHER FILE

export const downloadAvatarWithPath = async (path, name) => {
  const { data, error } = await supabase
    .storage
    .from('avatars')
    .download(`${path}/${name}`)

  if (error) {
    console.log("Error downloading avatar", error)
    return { error }
  }

  const fileUri = FileSystem.documentDirectory + name;
  try {
    const reader = new FileReader()
    reader.readAsDataURL(data)
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1]
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
    }

    return { uri: fileUri }
  } catch (fileError) {
    console.log("Error saving avatar to local file system", fileError);
    return { error: fileError }
  }
}

export const getLocalUriForImage = (path) => {
  const pathSections = path.split('/')
  const fileUri = FileSystem.documentDirectory + pathSections[pathSections.length - 1]
  return fileUri
}

export const deleteLocalImage = async (path) => {
  const fileUri = getLocalUriForImage(path)

  try {
    await FileSystem.deleteAsync(fileUri);
    console.log("Image deleted successfully");
  } catch (error) {
    console.log("Error deleting image", error);
  }
}

export const checkIfImageExistsWithPath = async (path) => {
  const fileUri = await getLocalUriForImage(path)
  // deleteLocalImage(path)

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    return { exists: fileInfo.exists, uri: fileUri }
  } catch (error) {
    console.log("Error checking if image exists", error)
    return { exists: false, uri: null }
  }
}