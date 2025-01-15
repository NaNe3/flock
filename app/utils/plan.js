const getTimeFromChapter = (book, chapter) => {
  const verses = Object.values(getVersesFromChapter(book, chapter))
  const verseWordCount = verses.reduce((acc, verse) => acc + verse.split(' ').length, 0)
  
  return Math.floor(verseWordCount / 150)
}

export const getCurrentWeekNumber = () => {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (currentDate - startOfYear) / 86400000; // 86400000 ms in a day
  return Math.floor((pastDaysOfYear + startOfYear.getDay()) / 7);
}

export const getWeekFromTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - startOfYear) / 86400000; // 86400000 ms in a day
  return Math.floor((pastDaysOfYear + startOfYear.getDay()) / 7);
}

export const getDatesOfCurrentWeek = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay()
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDay)
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date.getDate());
  }
  return { currentDay, dates }
}