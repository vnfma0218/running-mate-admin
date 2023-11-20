import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { MEETING_PER_PAGE, StyledTableCell } from '../utils/constants'

import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TableCell, TextField, Typography } from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import { IPageInfo } from './meetings'
import { useNavigate } from 'react-router-dom'
import Notice from '../models/notice'
import { QueryDocumentSnapshot, collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { db } from '../firebase'

export default function NotiePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])

  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    totalCount: 0,
    curPage: 1,
    hasMore: false,
  })
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true)
      let totalCnt = 0
      if (pageInfo.curPage === 1) {
        const coll = collection(db, 'notices')
        const snapshot = await getCountFromServer(coll)
        totalCnt = snapshot.data().count
        setPageInfo((prev) => ({ ...prev, totalCount: snapshot.data().count, curPage: prev.curPage + 1 }))
      } else {
        totalCnt = pageInfo.totalCount
      }
      let doc
      if (lastDoc) {
        doc = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(MEETING_PER_PAGE))
      } else {
        doc = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(MEETING_PER_PAGE))
      }

      const documentSnapshots = await getDocs(doc)
      const fetchedNotices: Notice[] = []

      if (!documentSnapshots.empty) {
        documentSnapshots.forEach((doc) => {
          const data = doc.data()
          const date = new Date(data['createdAt'].toDate())
          fetchedNotices.push(Notice.fromJson({ ['id']: doc.id, ...data, ['createdAt']: date }))
        })
      }

      const totalNotices = [...notices, ...fetchedNotices]

      setNotices(totalNotices)
      setPageInfo((prev) => ({ ...prev, hasMore: totalNotices.length < totalCnt }))

      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
      setLastDoc(lastVisible)
      setLoading(false)
    }

    fetchNotices()
  }, [])

  const newNoticePage = () => {
    navigate('/noticeDetail/new')
  }
  const noticeDetailPage = (id: string) => {
    navigate(`/noticeDetail/${id}`)
  }
  return (
    <Fragment>
      <Box sx={{ mb: 2, padding: '1rem', border: '1px solid #ebebeb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField id="outlined-size-small" size="small" label="제목" onChange={() => {}} />
          <FormControl sx={{ m: 1, minWidth: 120, ml: 2 }} size="small">
            <InputLabel id="demo-select-small-label">정렬</InputLabel>
            <Select labelId="demo-select-small-label" id="demo-select-small" label="정렬">
              <MenuItem value={'desc'}>최신순</MenuItem>
              <MenuItem value={'asc'}>오래된순</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => {}} sx={{ padding: '0.25rem 1.5rem' }} variant="contained">
            검색
          </Button>
        </Box>
      </Box>
      {loading && pageInfo.curPage === 1 ? (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fragment>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'end' }}>
            <Button variant="contained" onClick={newNoticePage}>
              공지 등록
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>제목</StyledTableCell>
                  <StyledTableCell>생성일</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow onClick={() => noticeDetailPage(notice.id)} hover key={notice.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}>
                    <TableCell sx={{ width: '200px' }} component="th" scope="row">
                      {notice.title}
                    </TableCell>
                    <TableCell>{notice.createdAt.toISOString().split('T')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Fragment>
      )}
    </Fragment>
  )
}
