import { Avatar } from '../ui/Avatar'
import { roleLabelUk } from '../../utils/roleLabels'
import type { Course } from '../../api/courses'

type CourseParticipantsModalProps = {
  course: Course
  onClose: () => void
}

export function CourseParticipantsModal({
  course,
  onClose,
}: CourseParticipantsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Учасники чату
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {course.title}
            </p>
          </div>

          <p
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-black cursor-pointer"
          >
            Закрити
          </p>
        </div>

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {course.participants?.map((participant) => (
            <div
              key={participant._id}
              className="flex items-center gap-3 rounded-lg border border-solid border-gray-100 p-3"
            >
              <Avatar
                fullName={participant.fullName}
                avatarUrl={participant.avatarUrl}
                size="sm"
              />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {participant.fullName}
                </p>
                <p className="text-xs text-gray-500">{participant.email}</p>
                <p className="text-xs text-gray-400">
                  {roleLabelUk(participant.role)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
