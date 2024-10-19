import { bookOfMormon } from '../../assets/books/book-of-mormon-reference'

export const getChaptersFromBook = (book) => {
  const chapters = bookOfMormon[book]
  const offset = bookOfMormon[book]['heading'] !== undefined ? -1 : 0
  return Object.keys(chapters).length + offset
}

export const getVersesFromChapter = (book, chapter) => {
  const verses = bookOfMormon[book][chapter]
  return verses
}