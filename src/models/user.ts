class User {
  id: string
  name: string
  email: string
  imageUrl: string

  constructor(id: string, name: string, email: string, imageUrl: string) {
    this.id = id
    this.name = name
    this.email = email
    this.imageUrl = imageUrl
  }
}

export default User
