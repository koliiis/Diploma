import type { Course } from '../../api/courses'
import { Avatar } from '../ui/Avatar'
import {
  buttonDangerClass,
  buttonPrimarySmallClass,
  buttonSecondaryClass,
  fieldClass,
} from './courseFormClasses'

type CourseCardProps = {
  course: Course
  currentUserId: string | undefined
  isEditing: boolean
  editTitle: string
  editGroup: string
  editDescription: string
  editImageUrl: string
  onEditTitleChange: (v: string) => void
  onEditGroupChange: (v: string) => void
  onEditDescriptionChange: (v: string) => void
  onEditImageUrlChange: (v: string) => void
  onStartEdit: (course: Course) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (courseId: string) => void
  onJoin: (courseId: string) => void
  onMessageTeacher: (teacherId: string) => void
  onOpenCourseChat: (chatId: string) => void
}

export function CourseCard({
  course,
  currentUserId,
  isEditing,
  editTitle,
  editGroup,
  editDescription,
  editImageUrl,
  onEditTitleChange,
  onEditGroupChange,
  onEditDescriptionChange,
  onEditImageUrlChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onJoin,
  onMessageTeacher,
  onOpenCourseChat,
}: CourseCardProps) {
  const isOwner = course.teacherId._id === currentUserId
  const showNonOwnerActions = course.teacherId._id !== currentUserId

  if (isEditing) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid gap-3 p-4">
          <input
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className={fieldClass}
          />

          <input
            value={editGroup}
            onChange={(e) => onEditGroupChange(e.target.value)}
            className={fieldClass}
          />

          <textarea
            value={editDescription}
            onChange={(e) => onEditDescriptionChange(e.target.value)}
            className={fieldClass}
          />

          <input
            value={editImageUrl}
            onChange={(e) => onEditImageUrlChange(e.target.value)}
            className={fieldClass}
            placeholder="Посилання на зображення"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveEdit}
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Зберегти
            </button>

            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-start gap-4 p-4">
        <div className="flex items-center justify-center p-4">
          <Avatar
            fullName={course.title}
            avatarUrl={course.imageUrl}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {course.title}
              </h3>

              <p className="mt-1 text-sm font-medium text-gray-500">
                Група: {course.group}
              </p>
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Учасників: {course.membersCount ?? 1}
          </p>

          <p className="mt-2 text-sm text-gray-600">{course.description}</p>

          <div className="mt-3 text-sm text-gray-500">
            <p>Викладач: {course.teacherId.fullName}</p>
            <p>Електронна адреса: {course.teacherId.email}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => onStartEdit(course)}
                  className={buttonSecondaryClass}
                >
                  Редагувати
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(course._id)}
                  className={buttonDangerClass}
                >
                  Видалити
                </button>

                {course.chatId && (
                  <button
                    type="button"
                    onClick={() => onOpenCourseChat(course.chatId!)}
                    className={buttonPrimarySmallClass}
                  >
                    Перейти до чату
                  </button>
                )}
              </>
            )}

            {showNonOwnerActions && (
              <>
                {course.isJoined ? (
                  <>
                    <span className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-600">
                      Ви приєдналися
                    </span>

                    {course.chatId && (
                      <button
                        type="button"
                        onClick={() => onOpenCourseChat(course.chatId!)}
                        className={buttonPrimarySmallClass}
                      >
                        Перейти до чату
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoin(course._id)}
                    className={buttonPrimarySmallClass}
                  >
                    До чату курсу
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onMessageTeacher(course.teacherId._id)}
                  className={buttonSecondaryClass}
                >
                  Написати викладачу
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
