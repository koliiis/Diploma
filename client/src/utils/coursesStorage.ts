import type { Course } from '../api/courses'

const STORAGE_KEY = 'campustalk_courses'

export function saveCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function loadCourses(): Course[] {
  const data = localStorage.getItem(STORAGE_KEY)

  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}