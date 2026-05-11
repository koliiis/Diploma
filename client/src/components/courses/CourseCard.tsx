import type { Course } from '../../api/courses'
import { fileToDataUrl } from '../../utils/fileToDataUrl'
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
  onOpenParticipants: (course: Course) => void
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
  onOpenParticipants,
}: CourseCardProps) {
  const isOwner = course.teacherId._id === currentUserId
  const showNonOwnerActions = course.teacherId._id !== currentUserId

  if (isEditing) {
    return (
      <div className="overflow-hidden rounded-[24px] bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:p-6">
          <div className="flex justify-center sm:block">
            <Avatar
              fullName={editTitle || course.title}
              avatarUrl={editImageUrl}
            />
          </div>
  
          <div className="min-w-0 flex-1">
            <div>
              <h3 className="text-xl font-bold text-[#10182f]">
                Редагування курсу
              </h3>
  
              <p className="mt-1 text-sm text-gray-500">
                Оновіть назву, групи, опис або зображення курсу.
              </p>
            </div>
  
            <div className="mt-5 grid gap-4">
              <input
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                placeholder="Назва курсу"
                className={fieldClass}
              />
  
              <input
                value={editGroup}
                onChange={(e) => onEditGroupChange(e.target.value)}
                placeholder="Групи, наприклад ТР-25, КН-21"
                className={fieldClass}
              />
  
              <textarea
                value={editDescription}
                onChange={(e) => onEditDescriptionChange(e.target.value)}
                placeholder="Опис курсу"
                className={`${fieldClass} min-h-28 resize-none`}
              />
  
              <label className="rounded-xl border border-dashed border-gray-300 bg-[#f8fafc] p-4 text-sm text-gray-600">
                <span className="font-semibold text-[#10182f]">
                  Змінити зображення курсу
                </span>
  
                <span className="mt-1 block text-xs text-gray-500">
                  PNG або JPG. Нове зображення буде відображатися в курсі та чаті.
                </span>
  
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
  
                    const dataUrl = await fileToDataUrl(file)
                    onEditImageUrlChange(dataUrl)
                  }}
                  className="mt-3 block w-full text-sm"
                />
              </label>
  
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className={buttonPrimarySmallClass}
                >
                  Зберегти
                </button>
  
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className={buttonSecondaryClass}
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:p-6">
        <div className="flex justify-center sm:block">
          <Avatar fullName={course.title} avatarUrl={course.imageUrl} />
        </div>
  
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#10182f]">
                {course.title}
              </h3>
  
              <p className="mt-2 text-sm font-medium text-[#0b67a3]">
                Групи: {course.groups.join(', ')}
              </p>
            </div>
  
            {course.isJoined && (
              <span className="w-fit rounded-full bg-[#eaf3fb] px-3 py-1 text-xs font-semibold text-[#0b67a3]">
                Ви приєдналися
              </span>
            )}
          </div>
  
          <p
            onClick={() => onOpenParticipants(course)}
            className="mt-3 text-sm font-medium text-gray-500 hover:text-[#0b67a3] cursor-pointer"
          >
            Учасників: {course.membersCount ?? 1}
          </p>
  
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {course.description}
          </p>
  
          <div className="mt-4 rounded-2xl bg-[#f8fafc] p-4 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-[#10182f]">Викладач:</span>{' '}
              {course.teacherId.fullName}
            </p>
            <p className="mt-1 break-all">
              <span className="font-semibold text-[#10182f]">
                Електронна адреса:
              </span>{' '}
              {course.teacherId.email}
            </p>
          </div>
  
          <div className="mt-5 flex flex-wrap items-center gap-2">
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
                {!course.isJoined && (
                  <button
                    type="button"
                    onClick={() => onJoin(course._id)}
                    className={buttonPrimarySmallClass}
                  >
                    Приєднатися
                  </button>
                )}
  
                {course.isJoined && course.chatId && (
                  <button
                    type="button"
                    onClick={() => onOpenCourseChat(course.chatId!)}
                    className={buttonPrimarySmallClass}
                  >
                    Перейти до чату
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
