import mongoose, { Schema, Document, Types } from 'mongoose'

export type ChatType = 'course' | 'direct'

export interface IChat extends Document {
  title: string
  type: ChatType
  courseId?: Types.ObjectId
  participantIds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const chatSchema = new Schema<IChat>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['course', 'direct'],
      default: 'course',
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    participantIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const ChatModel = mongoose.model<IChat>('Chat', chatSchema)