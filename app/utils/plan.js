const getTimeFromChapter = (book, chapter) => {
  const verses = Object.values(getVersesFromChapter(book, chapter))
  const verseWordCount = verses.reduce((acc, verse) => acc + verse.split(' ').length, 0)
  
  return Math.floor(verseWordCount / 150)
}

export default createPlan = () => {

  return {}
}