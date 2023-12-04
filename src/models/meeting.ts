import { plainToClass } from 'class-transformer'
import { MeetingStatus } from '../utils/constants'
import Report from './report'

class Meeting {
  id: string
  title: string
  desc: string
  location: string
  createdAt: Date
  status: MeetingStatus
  report: Report | undefined

  constructor(id: string, title: string, desc: string, location: string, createdAt: Date, status: MeetingStatus = MeetingStatus.normal, report: Report | undefined) {
    this.id = id
    this.title = title
    this.desc = desc
    this.location = location
    this.createdAt = createdAt
    this.status = status
    this.report = report
  }

  static fromJson(jsonData: Object) {
    return plainToClass(Meeting, jsonData)
  }
}

export default Meeting
