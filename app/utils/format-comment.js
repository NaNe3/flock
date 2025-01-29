export const getFontSizeOfComment = (comment) => {
  const length = comment.length

  if (length < 100) {
    return 36
  } else if (length < 200) {
    return 32
  } else if (length < 300) {
    return 28
  } else if (length < 400) {
    return 24
  } else {
    return 20
  }
}