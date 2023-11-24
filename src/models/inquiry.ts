import { plainToClass } from 'class-transformer'

class Inquiry {
  id: string
  title: string
  content: string
  user: string
  createdAt: Date
  reply?: string

  constructor(id: string, title: string, content: string, user: string, createdAt: Date, reply: string) {
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
