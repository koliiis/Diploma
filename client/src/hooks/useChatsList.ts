import { getChats } from '../api/chats'
import { loadChats, saveChats } from '../utils/chatsStorage'
import { useCachedListFetch } from './useCachedListFetch'

export function useChatsList() {
  return useCachedListFetch({
    loadCache: loadChats,
    saveCache: saveChats,
    fetch: getChats,
    fetchErrorMessage: 'Не вдалося завантажити чати',
  })
}
