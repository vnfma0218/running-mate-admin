class Meeting {
  id: string
  title: string
  desc: string
  location: string
  createdAt: Date

  constructor(id: string, title: string, desc: string, location: string, createdAt: Date) {
    this.id = id
    this.title = title
    this.desc = desc
    this.location = location
    this.createdAt = createdAt
  }
}

export default Meeting
