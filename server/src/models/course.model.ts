import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
  teacherId: Types.ObjectId
  studentIds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentIds: [
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

export const CourseModel = mongoose.model<ICourse>('Course', courseSchema)