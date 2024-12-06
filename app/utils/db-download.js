import supabase from "./supabase"
import * as FileSystem from 'expo-file-system'

// TO DO LIST HERE
// 1. PUT ALL FILE ALLOCATION FUNCTIONS IN THIS FILE
// 2. MOVE ALL STORAGE FUCNTIONS TO ANOTHER FILE

export const downloadFileWithPath = async (bucket, path, name) => {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .download(`${path}/${name}`)

  if (error) {
    console.log("Error downloading avatar", error)
    return { error }
  }

  const fileUri = FileSystem.documentDirectory + name
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

export const getLocalUriForFile = (path) => {
  if (path) {
    const pathSections = path.split('/')
    const fileUri = FileSystem.documentDirectory + pathSections[pathSections.length - 1]
    return fileUri
  }
}

export const deleteLocalFile = async (path) => {
  const fileUri = getLocalUriForFile(path)

  try {
    await FileSystem.deleteAsync(fileUri);
    console.log("Image deleted successfully");
  } catch (error) {
    console.log("Error deleting image", error);
  }
}

export const checkIfFileExistsWithPath = async (path) => {
  const fileUri = await getLocalUriForFile(path)
  // deleteLocalImage(path)

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    return { exists: fileInfo.exists, uri: fileUri }
  } catch (error) {
    console.log("Error checking if image exists", error)
    return { exists: false, uri: null }
  }
}

export const deleteLocalFileWithPath = async (path) => {
  const fileUri = await getLocalUriForFile(path)

  try {
    const result = await FileSystem.deleteAsync(fileUri)
    return { data: result }
  } catch (error) {
    return { error: error }
  }
}

export const moveLocalFileToNewPath = async ({ oldPath, newPath }) => {
  const newUri = await getLocalUriForFile(`/${newPath}`)

  try {
    const result = await FileSystem.moveAsync({ from: oldPath, to: newUri })
    return { data: result }
  } catch (error) {
    console.log("Error moving file to new path in local file system", error)
    return { error: error }
  }
}