import { useMemo, useState } from 'react'
import {
  createCourse,
  deleteCourse,
  updateCourse,
  type Course,
  joinCourse,
} from '../api/courses'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { createDirectChat } from '../api/chats'
import { useCoursesList } from '../hooks/useCoursesList'
import { CourseCreateForm } from '../components/courses/CourseCreateForm'
import { CourseListFilters } from '../components/courses/CourseListFilters'
import { CourseCard } from '../components/courses/CourseCard'
import { buttonPrimaryClass } from '../components/courses/courseFormClasses'

export function CoursesPage() {
  const {
    data: courses,
    isLoading,
    error,
    refetch: refreshCourses,
  } = useCoursesList()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [group, setGroup] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editGroup, setEditGroup] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyMine, setShowOnlyMine] = useState(false)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const query = searchQuery.toLowerCase().trim()
        const matchesSearch =
          course.title.toLowerCase().includes(query) ||
          course.group.toLowerCase().includes(query)
        const matchesMine = showOnlyMine ? course.isJoined : true
        return matchesSearch && matchesMine
      }),
    [courses, searchQuery, showOnlyMine],
  )

  const handleCreateCourse = async () => {
    if (!title.trim() || !description.trim() || !group.trim()) return

    try {
      setIsCreating(true)
      await createCourse({
        title: title.trim(),
        description: description.trim(),
        group: group.trim(),
        imageUrl: imageUrl.trim(),
      })
      setTitle('')
      setDescription('')
      setGroup('')
      setImageUrl('')
      setIsFormOpen(false)
      await refreshCourses()
    } catch {
      alert('Не вдалося створити курс')
    } finally {
      setIsCreating(false)
    }
  }

  const startEditCourse = (course: Course) => {
    setEditingCourseId(course._id)
    setEditTitle(course.title)
    setEditDescription(course.description)
    setEditGroup(course.group)
    setEditImageUrl(course.imageUrl ?? '')
  }

  const handleUpdateCourse = async () => {
    if (!editingCourseId) return
    await updateCourse(editingCourseId, {
      title: editTitle,
      description: editDescription,
      group: editGroup,
      imageUrl: editImageUrl,
    })
    setEditingCourseId(null)
    await refreshCourses()
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Видалити курс?')) return
    await deleteCourse(courseId)
    await refreshCourses()
  }

  const handleJoinCourse = async (courseId: string) => {
    try {
      await joinCourse(courseId)
      await refreshCourses()
    } catch {
      alert('Не вдалося приєднатися до курсу')
    }
  }

  const handleMessageTeacher = async (teacherId: string) => {
    try {
      const chat = await createDirectChat(teacherId)
      navigate(`/dashboard/chats/${chat._id}`)
    } catch {
      alert('Не вдалося відкрити чат з викладачем')
    }
  }

  const openCourseChat = (chatId: string) => {
    navigate(`/dashboard/chats/${chatId}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Courses</h1>

      {isTeacher && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className={buttonPrimaryClass}
          >
            {isFormOpen ? 'Close form' : 'Create course'}
          </button>
        </div>
      )}

      {isTeacher && isFormOpen && (
        <CourseCreateForm
          title={title}
          group={group}
          description={description}
          imageUrl={imageUrl}
          isCreating={isCreating}
          onChangeTitle={setTitle}
          onChangeGroup={setGroup}
          onChangeDescription={setDescription}
          onChangeImageUrl={setImageUrl}
          onSubmit={handleCreateCourse}
        />
      )}

      <CourseListFilters
        searchQuery={searchQuery}
        showOnlyMine={showOnlyMine}
        onSearchChange={setSearchQuery}
        onShowOnlyMineChange={setShowOnlyMine}
      />

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && filteredCourses.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Courses not found
          </p>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                currentUserId={user?._id}
                isEditing={editingCourseId === course._id}
                editTitle={editTitle}
                editGroup={editGroup}
                editDescription={editDescription}
                editImageUrl={editImageUrl}
                onEditTitleChange={setEditTitle}
                onEditGroupChange={setEditGroup}
                onEditDescriptionChange={setEditDescription}
                onEditImageUrlChange={setEditImageUrl}
                onStartEdit={startEditCourse}
                onSaveEdit={handleUpdateCourse}
                onCancelEdit={() => setEditingCourseId(null)}
                onDelete={handleDeleteCourse}
                onJoin={handleJoinCourse}
                onMessageTeacher={handleMessageTeacher}
                onOpenCourseChat={openCourseChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
