import { constants } from './styling/colors';

export const offered = [
  'Old Testament',
  'New Testament',
  'Book Of Mormon',
  'Doctrine And Covenants',
  'Pearl Of Great Price',
]

export const offeredColors = {
  'Old Testament': { background: '#000', text: constants.orange },
  'New Testament': { background: '#000', text: constants.orange },
  'Book Of Mormon': { background: constants.navy, text: constants.orange },
  'Doctrine And Covenants': { background: constants.heckaGray, text: constants.orange },
  'Pearl Of Great Price': { background: constants.heckaGray, text: constants.orange },
}
const books = {
  'Old Testament': [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  'New Testament': [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', 
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', 
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ],
  'Book Of Mormon': [
    '1 Nephi', '2 Nephi', 'Jacob', 'Enos', 'Jarom', 'Omni', 'Words of Mormon', 'Mosiah', 
    'Alma', 'Helaman', '3 Nephi', '4 Nephi', 'Mormon', 'Ether', 'Moroni'
  ],
  'Doctrine And Covenants': null,
  'Pearl Of Great Price': [
    'Moses', 'Abraham', 'Joseph Smith Matthew', 'Joseph Smith History', 'Articles of Faith'
  ],
}

const importBook = async (bookKey) => {
  switch (bookKey) {
    case offered[0]:
      return await import('../../assets/books/old-testament-reference');
    case offered[1]:
      return await import('../../assets/books/new-testament-reference');
    case offered[2]:
      return await import('../../assets/books/book-of-mormon-reference');
    case offered[3]:
      return await import('../../assets/books/doctrine-and-covenants-reference');
    case offered[4]:
      return await import('../../assets/books/pearl-of-great-price-reference');
    default:
      throw new Error('Unknown book key');
  }
}

export const getBook = async (requested) => {
  const { book } = await importBook(requested);
  return book;
}

const createNumberArray = (num) => {
  const arrayOfChapters = Array.from({ length: num }, (_, i) => i + 1);
  return arrayOfChapters
}

export const getBooksFromWork = (work) => {
  return { books: books[work] }
}

export const getChaptersFromBook = async (work, book) => {
  const content = await getBook(work)

  const chapters = content[book]
  const offset = content[book]['heading'] !== undefined ? -1 : 0
  const chapterCount = Object.keys(chapters).length + offset

  return { chapters: createNumberArray(chapterCount) }
}

export const getVersesFromChapter = async (work, book, chapter) => {
  const bookInQuestion = await getBook(work)

  const verses = bookInQuestion[book][chapter]
  return verses
}
