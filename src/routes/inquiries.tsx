import { QueryDocumentSnapshot, collection, doc, getCountFromServer, getDocs, limit, orderBy, query, startAfter, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import Inquiry from '../models/inquiry'
import { Box, Button, CircularProgress, Divider, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { IPageInfo, modalStyle } from './meetings'
import { StyledTableCell, TypeAlertModal } from '../utils/constants'
import { ArrowDownward } from '@mui/icons-material'
import CustomizedSnackbars from '../components/global/snackbar'

export default function InquiriesPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry>()
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const [replyString, setReplyString] = useState<string>('')
  const { loading, inquiries, setInquiries, pageInfo, setPageInfo, saveReply } = useInquery()
  const { modalInfo, openModal, closeModal, openAlert, closeAlert, openSnackbar, closeSnackbar } = useModalInfo({ alertType: 'meetingOpen' })

  const onNextData = () => {
    setPageInfo((prev) => ({ ...prev, curPage: prev.curPage + 1 }))
  }

  const onDetailInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    openModal()
  }

  const onChnageReplyMode = () => {
    setIsReplying(true)
  }

  const onSaveReply = async () => {
    if (replyString.trim().length < 1) {
      openSnackbar('답변을 최소 1자 이상 입력해주세요')
      return
    }
    await saveReply({ inquiryId: selectedInquiry!.id, reply: replyString })
    openSnackbar('답변을 저장했어요')
    setIsReplying(false)
    const updatedInquiryItem = { ...selectedInquiry!, reply: replyString }
    setSelectedInquiry(updatedInquiryItem)
    const updatedInquireis = [...inquiries]
    const foundedIdx = updatedInquireis.findIndex((el) => el.id === selectedInquiry!.id)
    updatedInquireis[foundedIdx] = updatedInquiryItem!
    setInquiries(updatedInquireis)
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
                  <StyledTableCell>생성일</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow onClick={() => onDetailInquiry(inquiry)} hover key={inquiry.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}>
                    <TableCell sx={{ width: '200px' }} component="th" scope="row">
                      {inquiry.title}
                    </TableCell>
                    <TableCell>{inquiry.createdAt.toISOString().split('T')[0]}</TableCell>
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
      <Modal
        open={modalInfo.modalOpen}
        onClose={() => {
          setIsReplying(false)
          closeModal()
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle, overflowY: 'scroll' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              상세정보
            </Typography>
            <Button onClick={() => {}} variant="contained" color="secondary" size="small">
              답변완료
            </Button>
          </Box>
          <Divider sx={{ mt: 1, bgcolor: 'black' }} />

          <Box>
            <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
              제목
            </Typography>
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {selectedInquiry?.title}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
              상세내용
            </Typography>
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {selectedInquiry?.content}
            </Typography>
          </Box>
          <Divider sx={{ my: 2, bgcolor: 'black' }} />

          <Box>
            <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
              답변
            </Typography>
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {(!isReplying && selectedInquiry?.reply) ?? '아직 답변내용이 없습니다.'}
              {isReplying && !selectedInquiry?.reply && (
                <TextField
                  onChange={(e) => {
                    setReplyString(e.target.value)
                  }}
                  fullWidth
                  id="outlined-textarea"
                  placeholder="답변을 작성해주세요"
                  multiline
                />
              )}
              {!selectedInquiry?.reply ? (
                <Button
                  onClick={() => {
                    if (!isReplying) {
                      onChnageReplyMode()
                    } else {
                      onSaveReply()
                    }
                  }}
                >
                  {isReplying ? '저장하기' : '답변 작성'}
                </Button>
              ) : null}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'end', mt: 4 }}>
            <Button
              onClick={() => {
                setIsReplying(false)
                closeModal()
              }}
              variant="contained"
              size="small"
            >
              닫기
            </Button>
          </Box>
        </Box>
      </Modal>
      <CustomizedSnackbars
        message={modalInfo.snackbarMessge}
        alertType={modalInfo.alertType ?? 'meetingDelete'}
        open={modalInfo.snackbarOpen}
        handleClose={() => {
          closeSnackbar()
          // setDetailOpen((prev) => ({ ...prev, snackbar: false }))
        }}
      />
    </>
  )
}

//  커스텀 훅 사용해서 데이터 fetch 하기
function useInquery() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    totalCount: undefined,
    curPage: 1,
    hasMore: false,
  })

  const getDocTotalCnt = async () => {
    const coll = collection(db, 'inquiries')
    const snapshot = await getCountFromServer(coll)

    setPageInfo((prev) => ({ ...prev, totalCount: snapshot.data().count }))
  }

  const saveReply = async ({ inquiryId, reply }: { inquiryId: string; reply: string }) => {
    const inquiryRef = doc(db, 'inquiries', inquiryId)

    await updateDoc(inquiryRef, {
      reply: reply,
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      let doc
      if (lastDoc) {
        doc = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(1))
      } else {
        doc = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(1))
      }
      const documentSnapshots = await getDocs(doc)
      const fetchedInquiries: Inquiry[] = []

      if (!documentSnapshots.empty) {
        documentSnapshots.forEach((doc) => {
          const data = doc.data()
          const date = new Date(data['createdAt'].toDate())

          fetchedInquiries.push(new Inquiry(doc.id, data['title'], data['content'], data['user'], date, data['reply']))
        })
      }

      const totalMeetings = [...inquiries, ...fetchedInquiries]
      setInquiries(totalMeetings)
      setPageInfo((prev) => ({ ...prev, hasMore: totalMeetings.length < pageInfo.totalCount! }))

      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
      setLastDoc(lastVisible)
      setLoading(false)
    }

    getDocTotalCnt()
    if (pageInfo.totalCount) {
      fetchData()
    }
  }, [pageInfo.totalCount, pageInfo.curPage])

  return { loading, inquiries, setInquiries, pageInfo, setPageInfo, saveReply }
}

interface IModalState {
  modalOpen: boolean
  alertOpen: boolean
  alertType: TypeAlertModal
  snackbarOpen: boolean
  snackbarMessge: string
}

function useModalInfo({ alertType }: { alertType: TypeAlertModal }) {
  const [modalInfo, setModalInfo] = useState<IModalState>({
    modalOpen: false,
    alertOpen: false,
    alertType: alertType,
    snackbarOpen: false,
    snackbarMessge: '',
  })

  const openModal = () => {
    setModalInfo((prev) => ({ ...prev, modalOpen: true }))
  }
  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, modalOpen: false }))
  }
  const openAlert = (type: TypeAlertModal) => {
    setModalInfo((prev) => ({ ...prev, alertType: type ? type : prev.alertType, alertOpen: true }))
  }
  const closeAlert = () => {
    setModalInfo((prev) => ({ ...prev, alertOpen: false }))
  }
  const openSnackbar = (message?: string) => {
    setModalInfo((prev) => ({ ...prev, snackbarMessge: message ?? '', snackbarOpen: true }))
  }
  const closeSnackbar = () => {
    setModalInfo((prev) => ({ ...prev, snackbarMessge: '', snackbarOpen: false }))
  }

  return { modalInfo, openModal, closeModal, openAlert, closeAlert, openSnackbar, closeSnackbar }
}
