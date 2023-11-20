import { plainToClass } from 'class-transformer'

class Notice {
  id: string
  title: string
  content: string
  createdAt: Date

  constructor(id: string, title: string, content: string, createdAt: Date) {
    this.id = id
    this.title = title
    this.content = content
    this.createdAt = createdAt
  }

  static fromJson(jsonData: Object) {
    return plainToClass(Notice, jsonData)
  }
}

export default Notice
