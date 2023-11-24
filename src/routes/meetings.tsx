import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { db } from '../firebase'
import { QueryDocumentSnapshot, collection, doc, getCountFromServer, getDocs, limit, orderBy, query, startAfter, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Meeting from '../models/meeting'
import { Box, Button, CircularProgress, Divider, Modal, Typography } from '@mui/material'
import { MEETING_PER_PAGE, MeetingStatus, StyledTableCell, TypeAlertModal } from '../utils/constants'
import { ArrowDownward } from '@mui/icons-material'
import AlertDialog from '../components/global/alertDialog'
import CustomizedSnackbars from '../components/global/snackbar'
import { PieChart } from '@mui/x-charts'

export const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: 400,
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

export interface IPageInfo {
  totalCount?: number
  curPage: number
  hasMore: boolean
}

interface IModalProps {
  detail: boolean
  deleteConfirm: boolean
  snackbar: boolean
  alertType: TypeAlertModal | undefined
}

export default function MeetingsPage() {
  const [selectedMeet, setSelectedMeet] = useState<Meeting | null>(null)
  const [detailOpen, setDetailOpen] = useState<IModalProps>({
    detail: false,
    deleteConfirm: false,
    snackbar: false,
    alertType: undefined,
  })
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
      totalCnt = pageInfo.totalCount ?? 0
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

        fetchedMeets.push(new Meeting(doc.id, data['title'], data['desc'], data['location']['formattedAddress'], date, data['status'] ?? 1, data['report']))
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

  const onCloseModel = () => {
    setDetailOpen((prev) => ({ ...prev, detail: false }))
  }
  const openDetailModal = (meet: Meeting) => {
    const alertType = meet.status === MeetingStatus.normal ? 'meetingDelete' : 'meetingOpen'
    setDetailOpen((prev) => ({ ...prev, detail: true, alertType: alertType }))
    setSelectedMeet(meet)
  }

  const onDeleteConfirmModalShow = () => {
    setDetailOpen((prev) => ({ ...prev, deleteConfirm: true }))
  }
  const onDeleteConfirmModalClose = () => {
    setDetailOpen((prev) => ({ ...prev, deleteConfirm: false }))
  }

  const onToggleMeetStatus = async () => {
    const articleRef = doc(db, 'articles', selectedMeet!.id)

    await updateDoc(articleRef, {
      status: selectedMeet?.status === MeetingStatus.normal ? MeetingStatus.stop : MeetingStatus.normal,
    })
    onDeleteConfirmModalClose()
    setMeetings((prev) => {
      const changedMeet = prev.find((meet) => meet.id === selectedMeet!.id)
      changedMeet!.status = changedMeet!.status === MeetingStatus.normal ? MeetingStatus.stop : MeetingStatus.normal
      return prev
    })
    const alertType = selectedMeet!.status === MeetingStatus.normal ? 'meetingDelete' : 'meetingOpen'

    setDetailOpen((prev) => ({ ...prev, snackbar: true, alertType: alertType }))
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
                  <StyledTableCell>상태</StyledTableCell>
                  <StyledTableCell>생성일자</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.map((meet) => (
                  <TableRow onClick={() => openDetailModal(meet)} hover key={meet.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}>
                    <TableCell component="th" scope="row">
                      {meet.title}
                    </TableCell>
                    <TableCell>{meet.location}</TableCell>
                    <TableCell>{meet.status === MeetingStatus.normal ? '정상' : '정지'}</TableCell>
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

      <Modal open={detailOpen.detail} onClose={onCloseModel} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={{ ...modalStyle, overflowY: 'scroll', minHeight: selectedMeet?.report ? '550px' : null }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              상세정보
            </Typography>
            <Button onClick={onDeleteConfirmModalShow} variant="contained" color="error" size="small">
              {selectedMeet?.status === MeetingStatus.normal ? '정지' : '정지취소'}
            </Button>
          </Box>
          <Divider sx={{ mt: 1, bgcolor: 'black' }} />
          <Box>
            <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
              제목
            </Typography>
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {selectedMeet?.title}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
              상세내용
            </Typography>
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {selectedMeet?.desc}
            </Typography>
          </Box>
          <Divider sx={{ mt: 1, bgcolor: 'black' }} />
          <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
            신고내역
          </Typography>
          {selectedMeet?.report ? (
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: selectedMeet.report.sexualContent, label: '성적 콘텐츠' },
                    { id: 1, value: selectedMeet.report.abuseContent, label: '욕설 콘텐츠' },
                    { id: 3, value: selectedMeet.report.marketingContent, label: '홍보 콘텐츠' },
                    { id: 4, value: selectedMeet.report.etc, label: '기타 부적절 콘텐츠' },
                  ],
                },
              ]}
              width={500}
              height={200}
            />
          ) : null}

          <Box sx={{ display: 'flex', justifyContent: 'end', mt: 4 }}>
            <Button onClick={onCloseModel} variant="contained" size="small">
              닫기
            </Button>
          </Box>
        </Box>
      </Modal>
      <AlertDialog alertType={detailOpen.alertType ?? 'meetingDelete'} open={detailOpen.deleteConfirm} cancelCbFn={onDeleteConfirmModalClose} confirmCbFn={onToggleMeetStatus} />
      <CustomizedSnackbars
        alertType={detailOpen.alertType ?? 'meetingDelete'}
        open={detailOpen.snackbar}
        handleClose={() => {
          setDetailOpen((prev) => ({ ...prev, snackbar: false }))
        }}
      />
    </>
  )
}
