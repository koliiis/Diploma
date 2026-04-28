import { getCourses } from '../api/courses'
import { loadCourses, saveCourses } from '../utils/coursesStorage'
import { useCachedListFetch } from './useCachedListFetch'

export function useCoursesList() {
  return useCachedListFetch({
    loadCache: loadCourses,
    saveCache: saveCourses,
    fetch: getCourses,
    fetchErrorMessage: 'Не вдалося завантажити курси',
  })
}
