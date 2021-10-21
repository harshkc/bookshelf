import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from './api-client'
import {setBookQueryData} from './books'

function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess(listItems) {
        for (const li of listItems) {
          setBookQueryData(li.book)
        }
      },
    },
  })

  return listItems ?? []
}

function useListItemById({user, bookId}) {
  const listItems = useListItems(user)
  return listItems.find(li => li.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onError: (err, variables, recovery) =>
    typeof recovery === 'function' ? recovery() : null,
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useUpdateListItem(user, options) {
  return useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
        token: user.token,
      }),
    {
      onMutate(updates) {
        const previousItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', old => {
          return old.map(li =>
            li.id === updates.id ? {...li, ...updates} : li,
          )
        })
        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
  )
}

function useRemoveListItem(user, options) {
  return useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token: user.token}),
    {
      onMutate(removedItem) {
        const previousItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', old => {
          return old.filter(item => item.id !== removedItem.listItemId)
        })
        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
  )
}

function useCreateListItem(user, options) {
  return useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token: user.token}),
    {
      ...defaultMutationOptions,
      ...options,
    },
  )
}

export {
  useListItemById,
  useListItems,
  useUpdateListItem,
  useRemoveListItem,
  useCreateListItem,
}
