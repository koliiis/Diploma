import { useEffect, useState } from 'react'
import { getCourses, type Course } from '../api/courses'

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch {
        setError('Не вдалося завантажити курси')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Courses
      </h1>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {course.title}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {course.description}
                </p>

                <div className="mt-3 text-sm text-gray-500">
                  <p>
                    Викладач: {course.teacherId.fullName}
                  </p>
                  <p>
                    Email: {course.teacherId.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}