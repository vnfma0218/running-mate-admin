import { Box, CircularProgress, Typography } from '@mui/material'
import { BarChart, axisClasses } from '@mui/x-charts'
import { Fragment, useCallback, useEffect, useState } from 'react'
import User from '../models/user'
import { collection, getDocs } from 'firebase/firestore'

import { db } from '../firebase'
import { UserStatus } from '../utils/constants'
import Meeting from '../models/meeting'
import Report from '../models/report'

const xLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const chartSetting = {
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: 'translate(-20px, 0)',
    },
  },
}
const valueFormatter = (value: number) => `${value}건`

export default function HomePage() {
  const { users, loading } = useUsers()
  const { meetings } = useMeetings()
  const { reports } = userReports()

  return (
    <Fragment>
      <Box sx={{ my: 2 }}>
        <Typography sx={{ mb: 4 }}>회원가입 현황</Typography>
        {loading ? (
          <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
            <CircularProgress />
          </Box>
        ) : null}
        {users.length ? (
          <BarChart
            height={400}
            series={[
              {
                data: users,
                label: '회원가입',
                id: 'pvId',

                yAxisKey: 'leftAxisId',
              },
            ]}
            xAxis={[{ data: xLabels, scaleType: 'band' }]}
            yAxis={[{ id: 'leftAxisId' }, { id: 'rightAxisId' }]}
            rightAxis="rightAxisId"
          />
        ) : null}
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography>신고 현황</Typography>
        {reports.length ? (
          <BarChart
            dataset={reports}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={[
              { dataKey: 'abuseContent', label: '욕설 콘텐츠', valueFormatter },
              { dataKey: 'etc', label: '기타', valueFormatter },
              { dataKey: 'marketingContent', label: '광고 콘텐츠', valueFormatter },
              { dataKey: 'sexualContent', label: '성적 콘텐츠', valueFormatter },
            ]}
            {...chartSetting}
            height={400}
          />
        ) : null}
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography>모임 현황</Typography>
        {meetings.length ? (
          <BarChart
            height={400}
            series={[
              {
                data: meetings,
                label: '모임',
                id: 'pvId',

                yAxisKey: 'leftAxisId',
              },
            ]}
            xAxis={[{ data: xLabels, scaleType: 'band' }]}
            yAxis={[{ id: 'leftAxisId' }, { id: 'rightAxisId' }]}
            rightAxis="rightAxisId"
          />
        ) : null}
      </Box>
    </Fragment>
  )
}

function useUsers() {
  const [users, setUsers] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const filteredByDateUsers = useCallback((users: User[]) => {
    const userOrderByMonth = Array(12).fill(0)
    users.forEach((user) => {
      const month = Number(user.createdAt.toLocaleString('default', { month: 'numeric' }))
      userOrderByMonth[month - 1] = userOrderByMonth[month - 1] + 1
    })
    return userOrderByMonth
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const querySnapshot = await getDocs(collection(db, 'users'))
      const fetchedUsers = [] as User[]

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = new Date(data['createdAt'].toDate())
        const user = new User(doc.id, data['name'], data['email'], data['imageUrl'], createdAt, data['status'] ?? UserStatus.normal)
        fetchedUsers.push(user)
      })
      setUsers(filteredByDateUsers(fetchedUsers))

      setLoading(false)
    }
    fetchData()
  }, [])

  return { loading, users }
}
function userReports() {
  const [reports, setReports] = useState<{ [key: string]: string | number | Date }[]>([])
  const [loading, setLoading] = useState(false)

  const filteredByDateMeetings = useCallback((reports: Report[]) => {
    let reportOrderByMonth = new Array(11).fill(0).map((_, i) => ({ month: `${i + 1}월`, abuseContent: 0, etc: 0, marketingContent: 0, sexualContent: 0 }))
    reports.forEach((report) => {
      const month = Number(report.createdAt.toLocaleString('default', { month: 'numeric' }))
      const prevCnt = reportOrderByMonth[month - 1]

      if (reportOrderByMonth[month - 1]) {
        reportOrderByMonth[month - 1] = {
          month: `${month}월`,
          abuseContent: prevCnt['abuseContent'] + report.count.abuseContent,
          etc: prevCnt['etc'] + report.count.etc,
          marketingContent: prevCnt['marketingContent'] + report.count.marketingContent,
          sexualContent: prevCnt['sexualContent'] + report.count.sexualContent,
        }
      } else {
        reportOrderByMonth[month - 1] = {
          month: `${month}월`,
          abuseContent: report.count.abuseContent,
          etc: report.count.etc,
          marketingContent: report.count.marketingContent,
          sexualContent: report.count.sexualContent,
        }
      }
    })
    return reportOrderByMonth
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const querySnapshot = await getDocs(collection(db, 'reports'))
      const fetchedReports = [] as Report[]

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = new Date(data['createdAt'].toDate())
        fetchedReports.push(Report.fromJson({ ...data, ['createdAt']: createdAt, ['id']: doc.id }))
      })
      setReports(filteredByDateMeetings(fetchedReports))
      console.log(filteredByDateMeetings(fetchedReports))
      setLoading(false)
    }
    fetchData()
  }, [])

  return { loading, reports }
}

function useMeetings() {
  const [meetings, setMeetings] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const filteredByDateMeetings = useCallback((meetings: Meeting[]) => {
    const userOrderByMonth = Array(12).fill(0)
    meetings.forEach((meeting) => {
      const month = Number(meeting.createdAt.toLocaleString('default', { month: 'numeric' }))
      userOrderByMonth[month - 1] = userOrderByMonth[month - 1] + 1
    })
    return userOrderByMonth
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const querySnapshot = await getDocs(collection(db, 'articles'))
      const fetchedMeets = [] as Meeting[]

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = new Date(data['createdAt'].toDate())
        fetchedMeets.push(new Meeting(doc.id, data['title'], data['desc'], data['location']['formattedAddress'], createdAt, data['status'] ?? 1, data['report']))
      })
      setMeetings(filteredByDateMeetings(fetchedMeets))

      setLoading(false)
    }
    fetchData()
  }, [])

  return { loading, meetings }
}
