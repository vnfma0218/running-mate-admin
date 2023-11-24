import { plainToClass } from 'class-transformer'
import { UserStatus } from '../utils/constants'

class User {
  id: string
  name: string
  email: string
  imageUrl: string
  createdAt: Date
  status: UserStatus

  constructor(id: string, name: string, email: string, imageUrl: string, createdAt: Date, status: UserStatus = UserStatus.normal) {
    this.id = id
    this.name = name
    this.email = email
    this.imageUrl = imageUrl
    this.createdAt = createdAt
    this.status = status
  }
  static fromJson(jsonData: Object) {
    return plainToClass(User, jsonData)
  }
}

export default User
