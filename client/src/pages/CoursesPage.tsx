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
import { CourseParticipantsModal } from '../components/courses/CourseParticipantsModal'
import toast from 'react-hot-toast'

export function CoursesPage() {
  const {
    data: courses,
    isLoading,
    error,
    refetch: refreshCourses,
  } = useCoursesList()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [groupsInput, setGroupsInput] = useState('')
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const query = searchQuery.toLowerCase().trim()

        const title = course.title?.toLowerCase() ?? ''

        const matchesMine = showOnlyMine ? course.isJoined : true

        const courseGroups = course.groups ?? []
        const userGroup = user?.group?.toLowerCase() ?? ''

        const groupValue = courseGroups.join(', ').toLowerCase()

        const matchesMyGroup =
          showMyGroupOnly && userGroup
            ? courseGroups.some((group) => group.toLowerCase() === userGroup)
            : true


        const matchesSearch =
          title.includes(query) || groupValue.includes(query)

        return matchesSearch && matchesMine && matchesMyGroup
      }),
    [courses, searchQuery, showOnlyMine, showMyGroupOnly, user?.group],
  )

  const handleCreateCourse = async () => {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedGroups = groupsInput
      .split(',')
      .map((group) => group.trim().toUpperCase())
      .filter(Boolean)
    const trimmedImageUrl = imageUrl.trim()

    const groupRegex = /^[А-ЯІЇЄҐA-Z]{2}-\d{2}$/

    if (!trimmedTitle || !trimmedDescription || !trimmedGroups.length) {
      setCreateCourseError('Заповніть назву, опис і групу курсу')
      return
    }

    if (!trimmedGroups.every((group) => groupRegex.test(group))) {
      setCreateCourseError('Формат групи має бути як ТР-25 або ж ТР-21, ТР-22')
      return
    }

    try {
      setCreateCourseError(null)
      setIsCreating(true)

      await createCourse({
        title: trimmedTitle,
        description: trimmedDescription,
        groups: trimmedGroups,
        imageUrl: trimmedImageUrl,
      })

      setTitle('')
      setDescription('')
      setGroupsInput('')
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
    setEditGroup(course.groups?.join(', ') ?? '')
    setEditImageUrl(course.imageUrl ?? '')
  }

  const handleUpdateCourse = async () => {
    if (!editingCourseId) return

    const editedGroups = editGroup
      .split(',')
      .map((group) => group.trim().toUpperCase())
      .filter(Boolean)

    await updateCourse(editingCourseId, {
      title: editTitle,
      description: editDescription,
      groups: editedGroups,
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
      toast.error('Не вдалося приєднатися до курсу')
    }
  }

  const handleMessageTeacher = async (teacherId: string) => {
    try {
      const chat = await createDirectChat(teacherId)
      navigate(`/dashboard/chats/${chat._id}`)
    } catch {
      toast.error('Не вдалося відкрити чат з викладачем')
    }
  }

  const openCourseChat = (chatId: string) => {
    navigate(`/dashboard/chats/${chatId}`)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
            Навчальні модулі
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#10182f] sm:text-4xl">
            Курси
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Переглядайте доступні курси, приєднуйтесь до чатів курсів або
            створюйте власні навчальні простори.
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className={buttonPrimaryClass}
          >
            {isFormOpen ? 'Закрити форму' : 'Створити курс'}
          </button>
        )}
      </div>

      {isTeacher && isFormOpen && (
        <CourseCreateForm
          title={title}
          groupsInput={groupsInput}
          description={description}
          imageUrl={imageUrl}
          isCreating={isCreating}
          onChangeTitle={setTitle}
          onChangeDescription={setDescription}
          onChangeImageUrl={setImageUrl}
          onSubmit={handleCreateCourse}
          error={createCourseError}
          onChangeGroup={(value) => setGroupsInput(value)}
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
          <div className="rounded-[22px] bg-white p-6 text-sm text-gray-500 shadow-sm">
            Завантаження курсів...
          </div>
        )}

        {error && (
          <div className="rounded-[22px] bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredCourses.length === 0 && (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#10182f]">
              Курси не знайдено
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Спробуйте змінити пошуковий запит або фільтри.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="grid gap-4">
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
                onOpenParticipants={setSelectedCourse}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCourse && (
        <CourseParticipantsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  )
}
