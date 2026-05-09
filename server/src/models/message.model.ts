import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMessage extends Document {
  chatId: Types.ObjectId
  authorId: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
  readByIds: Types.ObjectId[]
  attachments?: {
    url: string
    name: string
    type: string
  }[]
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    readByIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema)