import { plainToClass } from 'class-transformer'
import User from './user'

export type TypeInquiryReply = {
  content: string
  isSaved: boolean
}

class Inquiry {
  id: string
  title: string
  content: string
  user: User
  createdAt: Date
  reply?: TypeInquiryReply

  constructor(id: string, title: string, content: string, user: User, createdAt: Date, reply: TypeInquiryReply) {
    this.id = id
    this.title = title
    this.content = content
    this.user = user
    this.createdAt = createdAt
    this.reply = reply
  }

  static fromJson(jsonData: Object) {
    return plainToClass(Inquiry, jsonData)
  }
}

export default Inquiry
