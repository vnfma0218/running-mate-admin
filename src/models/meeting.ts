import { plainToClass } from 'class-transformer'
import { MeetingStatus } from '../utils/constants'

class Meeting {
  id: string
  title: string
  desc: string
  location: string
  createdAt: Date
  status: MeetingStatus
  report?: { [key in ReportType]: number }

  constructor(id: string, title: string, desc: string, location: string, createdAt: Date, status: MeetingStatus = MeetingStatus.normal, report: { [key in ReportType]: number }) {
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

type ReportType = 'abuseContent' | 'etc' | 'marketingContent' | 'sexualContent'

export default Meeting
