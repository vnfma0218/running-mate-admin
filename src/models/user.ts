class User {
  id: string
  name: string
  email: string
  imageUrl: string
  createdAt: Date

  constructor(id: string, name: string, email: string, imageUrl: string, createdAt: Date) {
    this.id = id
    this.name = name
    this.email = email
    this.imageUrl = imageUrl
    this.createdAt = createdAt
  }
}

export default User
