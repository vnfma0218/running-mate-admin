import { MeetingStatus } from '../utils/constants'

class Meeting {
  id: string
  title: string
  desc: string
  location: string
  createdAt: Date
  status: MeetingStatus

  constructor(id: string, title: string, desc: string, location: string, createdAt: Date, status: MeetingStatus = MeetingStatus.normal) {
    this.id = id
    this.title = title
    this.desc = desc
    this.location = location
    this.createdAt = createdAt
    this.status = status
  }
}

export default Meeting
