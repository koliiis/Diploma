import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'student' | 'teacher'

export interface IUser extends Document {
  fullName: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
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
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const UserModel = mongoose.model<IUser>('User', userSchema)