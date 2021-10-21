import {useQuery, queryCache} from 'react-query'
import {client} from '../utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

const getBooksByQuery = (query, user) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    client(`books?query=${encodeURIComponent(query)}`, {
      token: user.token,
    }).then(data => data.books),
  config: {
    onSuccess(books) {
      for (const book of books) {
        setBookQueryData(book)
      }
    },
  },
})

function useBookSearch({user, query}) {
  const result = useQuery(getBooksByQuery(query, user))
  return {...result, books: result.data ?? loadingBooks}
}

function useBookSearchById({user, bookId}) {
  const result = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })
  return {...result, book: result.data ?? loadingBook}
}

async function refetchBookSearchQuery(user) {
  console.log('refetching book search query')
  queryCache.removeQueries('bookSearch')
  await queryCache.prefetchQuery(getBooksByQuery('', user))
}

function setBookQueryData(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}

export {
  useBookSearch,
  useBookSearchById,
  refetchBookSearchQuery,
  setBookQueryData,
}
