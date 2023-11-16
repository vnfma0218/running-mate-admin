import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { db } from '../firebase'
import { QueryDocumentSnapshot, collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Meeting from '../models/meeting'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { MEETING_PER_PAGE, StyledTableCell } from '../utils/constants'
import { ArrowDownward } from '@mui/icons-material'

interface IPageInfo {
  totalCount: number
  curPage: number
  hasMore: boolean
}

export default function MeetingsPage() {
  const [loading, setLoading] = useState(false)

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    totalCount: 0,
    curPage: 1,
    hasMore: false,
  })
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)

    let totalCnt = 0
    if (pageInfo.curPage === 1) {
      const coll = collection(db, 'articles')
      const snapshot = await getCountFromServer(coll)
      totalCnt = snapshot.data().count
      setPageInfo((prev) => ({ ...prev, totalCount: snapshot.data().count, curPage: prev.curPage + 1 }))
    } else {
      totalCnt = pageInfo.totalCount
      console.log('pageInfo.curPage', pageInfo.curPage)
    }

    let doc
    if (lastDoc) {
      doc = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(MEETING_PER_PAGE))
    } else {
      doc = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(MEETING_PER_PAGE))
    }

    const documentSnapshots = await getDocs(doc)
    const fetchedMeets: Meeting[] = []

    if (!documentSnapshots.empty) {
      documentSnapshots.forEach((doc) => {
        const data = doc.data()
        const date = new Date(data['createdAt'].toDate())
        fetchedMeets.push(new Meeting(doc.id, data['title'], data['desc'], data['location']['formattedAddress'], date))
      })
    }
    const totalMeetings = [...meetings, ...fetchedMeets]

    setMeetings(totalMeetings)
    setPageInfo((prev) => ({ ...prev, hasMore: totalMeetings.length < totalCnt }))

    const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
    setLastDoc(lastVisible)
    setLoading(false)
  }

  const onNextData = () => {
    fetchMeetings()
  }
  return (
    <>
      {loading && pageInfo.curPage === 1 ? (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>제목</StyledTableCell>
                  <StyledTableCell>장소</StyledTableCell>
                  <StyledTableCell>생성일자</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.map((meet) => (
                  <TableRow hover key={meet.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}>
                    <TableCell component="th" scope="row">
                      {meet.title}
                    </TableCell>
                    <TableCell>{meet.location}</TableCell>
                    <TableCell>{meet.createdAt.toISOString().split('T')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pageInfo.hasMore ? (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={onNextData}>
                <Typography>더보기</Typography>
                <ArrowDownward />
              </Button>
            </Box>
          ) : null}
        </Box>
      )}
    </>
  )
}
