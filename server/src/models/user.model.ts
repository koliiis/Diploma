import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'student' | 'teacher'

export interface IUser extends Document {
  fullName: string
  email: string
  password: string
  role: UserRole
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
  group?: string
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    group: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const UserModel = mongoose.model<IUser>('User', userSchema)