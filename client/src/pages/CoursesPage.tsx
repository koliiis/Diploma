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
  const [createCourseError, setCreateCourseError] = useState<string | null>(null)
  const [showMyGroupOnly, setShowMyGroupOnly] = useState(false)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const query = searchQuery.toLowerCase().trim()
  
        const title = course.title?.toLowerCase() ?? ''
        const groupValue = course.group?.toLowerCase() ?? ''
        const userGroup = user?.group?.toLowerCase() ?? ''
  
        const matchesSearch =
          title.includes(query) || groupValue.includes(query)
  
        const matchesMine = showOnlyMine ? course.isJoined : true
  
        const matchesMyGroup =
          showMyGroupOnly && userGroup
            ? groupValue === userGroup
            : true
  
        return matchesSearch && matchesMine && matchesMyGroup
      }),
    [courses, searchQuery, showOnlyMine, showMyGroupOnly, user?.group],
  )

  const handleCreateCourse = async () => {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedGroup = group.trim().toUpperCase()
    const trimmedImageUrl = imageUrl.trim()
  
    const groupRegex = /^[А-ЯІЇЄҐA-Z]{2}-\d{2}$/
  
    if (!trimmedTitle || !trimmedDescription || !trimmedGroup) {
      setCreateCourseError('Заповніть назву, опис і групу курсу')
      return
    }
  
    if (!groupRegex.test(trimmedGroup)) {
      setCreateCourseError('Формат групи має бути як ТР-25')
      return
    }
  
    try {
      setCreateCourseError(null)
      setIsCreating(true)
  
      await createCourse({
        title: trimmedTitle,
        description: trimmedDescription,
        group: trimmedGroup,
        imageUrl: trimmedImageUrl,
      })
  
      setTitle('')
      setDescription('')
      setGroup('')
      setImageUrl('')
      setIsFormOpen(false)
  
      await refreshCourses()
    } catch {
      setCreateCourseError('Не вдалося створити курс')
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
      <h1 className="text-2xl font-bold text-gray-900">Курси</h1>

      {isTeacher && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className={buttonPrimaryClass}
          >
            {isFormOpen ? 'Закрити форму' : 'Створити курс'}
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
          onChangeDescription={setDescription}
          onChangeImageUrl={setImageUrl}
          onSubmit={handleCreateCourse}
          error={createCourseError}
          onChangeGroup={(value) => setGroup(value.toUpperCase())}
        />
      )}

      <CourseListFilters
        searchQuery={searchQuery}
        showOnlyMine={showOnlyMine}
        showMyGroupOnly={showMyGroupOnly}
        canFilterByGroup={user?.role === 'student' && Boolean(user?.group)}
        onSearchChange={setSearchQuery}
        onShowOnlyMineChange={setShowOnlyMine}
        onShowMyGroupOnlyChange={setShowMyGroupOnly}
      />

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && filteredCourses.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Курси не знайдено
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
