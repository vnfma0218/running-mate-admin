import { plainToClass } from 'class-transformer'
type ReportType = 'abuseContent' | 'etc' | 'marketingContent' | 'sexualContent'

class Report {
  id: string
  articleId: string
  count: { [key in ReportType]: number }
  createdAt: Date

  constructor(id: string, articleId: string, count: { [key in ReportType]: number }, createdAt: Date) {
    this.id = id
    this.articleId = articleId
    this.count = count
    this.createdAt = createdAt
  }

  static fromJson(jsonData: Object) {
    return plainToClass(Report, jsonData)
  }
}

export default Report
