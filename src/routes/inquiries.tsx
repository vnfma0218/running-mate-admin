import { QueryDocumentSnapshot, collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, startAfter, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import Inquiry, { TypeInquiryReply } from '../models/inquiry'
import { Box, Button, CircularProgress, Divider, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { IPageInfo, modalStyle } from './meetings'
import { StyledTableCell } from '../utils/constants'
import { ArrowDownward } from '@mui/icons-material'
import CustomizedSnackbars from '../components/global/snackbar'
import useModalInfo from '../hooks/useModal'
import AlertDialog from '../components/global/alertDialog'
import User from '../models/user'
import UserDetailModal from '../components/inquiry/UserDetailModal'

export const clickableRowStyle = {
  display: 'inline-block',
  color: 'rgb(0, 127, 255)',
  textDecoration: 'underline',
}

export default function InquiriesPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry>()
  const [selectedUser, setSelectedUser] = useState<User>()
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const [replyString, setReplyString] = useState<string>('')
  const { loading, inquiries, setInquiries, pageInfo, setPageInfo, saveReply } = useInquery()
  const { modalInfo, openModal, closeModal, openSnackbar, closeSnackbar, closeAlert, openAlert } = useModalInfo({ alertType: 'saveReply' })
  const { modalInfo: userModalInfo, openModal: userOpenModal, closeModal: userCloseModal } = useModalInfo({ alertType: 'deleteNotice' })

  const onNextData = () => {
    setPageInfo((prev) => ({ ...prev, curPage: prev.curPage + 1 }))
  }

  const onDetailInquiry = (inquiry: Inquiry) => {
    setReplyString(inquiry.reply?.content ?? '')
    setSelectedInquiry(inquiry)
    openModal()
  }

  const onChnageReplyMode = () => {
    setIsReplying(true)
  }

  const onSaveReply = async () => {
    const reply = {
      isSaved: true,
      content: replyString,
      savedAt: serverTimestamp(),
    }
    await saveReply({ inquiryId: selectedInquiry!.id, reply: reply })
    closeAlert()
    openSnackbar('답변을 완료했어요')
    const updatedInquiryItem = { ...selectedInquiry!, reply }
    updateCurInquiryList(updatedInquiryItem)
  }

  const onConfirmSaveReply = () => {
    openAlert()
  }

  const updateCurInquiryList = (updatedInq: Inquiry) => {
    setSelectedInquiry(updatedInq)

    const foundedIdx = inquiries.findIndex((el) => el.id === updatedInq.id)
    const willUpdateList = [...inquiries]
    willUpdateList[foundedIdx] = updatedInq
    setInquiries(willUpdateList)
  }

  const onSaveReplyContent = async () => {
    if (replyString.trim().length < 1) {
      openSnackbar('답변을 최소 1자 이상 입력해주세요')
      return
    }
    const reply = {
      isSaved: selectedInquiry?.reply?.isSaved ?? false,
      content: replyString,
    }

    await saveReply({ inquiryId: selectedInquiry!.id, reply: reply })
    openSnackbar('답변 내용을 저장했어요')
    setIsReplying(false)
    const updatedInquiryItem = { ...selectedInquiry!, reply }
    updateCurInquiryList(updatedInquiryItem)
  }

  const selectUser = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, user: User) => {
    e.stopPropagation()
    setSelectedUser(user)
    userOpenModal()
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
                  <StyledTableCell>문의유저</StyledTableCell>
                  <StyledTableCell>문의일</StyledTableCell>
                  <StyledTableCell>답변 여부</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow onClick={() => onDetailInquiry(inquiry)} hover key={inquiry.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}>
                    <TableCell sx={{ width: '200px' }} component="th" scope="row">
                      {inquiry.title}
                    </TableCell>
                    <TableCell>
                      <Typography onClick={(e) => selectUser(e, inquiry.user)} style={{ ...clickableRowStyle }}>
                        {inquiry.user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{inquiry.createdAt.toISOString().split('T')[0]}</TableCell>

                    <TableCell>{inquiry.reply?.isSaved ? '답변완료' : '미완료'}</TableCell>
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
            {selectedInquiry?.reply?.isSaved ? (
              <Typography id="modal-modal-title" sx={{ border: '1px solid black', padding: 1, borderRadius: '5px', fontSize: '13px' }}>
                완료된 답변
              </Typography>
            ) : null}
            {!selectedInquiry?.reply?.isSaved ? (
              <Button disabled={selectedInquiry?.reply == null ? true : false} onClick={onConfirmSaveReply} variant="contained" color="secondary" size="small">
                답변저장
              </Button>
            ) : null}
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" id="modal-modal-description" sx={{ fontWeight: 'bold' }}>
                답변
              </Typography>
            </Box>
            {isReplying && (
              <TextField
                value={replyString}
                sx={{ mt: 1 }}
                onChange={(e) => {
                  setReplyString(e.target.value)
                }}
                fullWidth
                id="outlined-textarea"
                placeholder="답변을 작성해주세요"
                multiline
              />
            )}
            <Typography variant="body2" id="modal-modal-description" sx={{ mt: 1 }}>
              {(!isReplying && selectedInquiry?.reply?.content) ?? '아직 답변내용이 없습니다.'}

              {!selectedInquiry?.reply ? (
                <Button
                  onClick={() => {
                    if (!isReplying) {
                      onChnageReplyMode()
                    } else {
                      onSaveReplyContent()
                    }
                  }}
                >
                  {isReplying ? '저장하기' : '답변 작성'}
                </Button>
              ) : null}
            </Typography>
            {!selectedInquiry?.reply?.isSaved && selectedInquiry?.reply ? (
              <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <Button
                  onClick={() => {
                    if (!isReplying) {
                      setReplyString(selectedInquiry.reply?.content!)
                      onChnageReplyMode()
                    } else {
                      onSaveReplyContent()
                    }
                  }}
                >
                  {isReplying ? '수정 완료' : '답변 수정'}
                </Button>
              </Box>
            ) : null}
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
      <UserDetailModal user={selectedUser!} modalOpen={userModalInfo.modalOpen} closeModal={userCloseModal} />
      <AlertDialog alertType={modalInfo.alertType} cancelCbFn={closeAlert} open={modalInfo.alertOpen} confirmCbFn={onSaveReply} />
      <CustomizedSnackbars
        message={modalInfo.snackbarMessge}
        alertType={modalInfo.alertType ?? 'meetingDelete'}
        open={modalInfo.snackbarOpen}
        handleClose={() => {
          closeSnackbar()
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

  const saveReply = async ({ inquiryId, reply }: { inquiryId: string; reply: TypeInquiryReply }) => {
    const inquiryRef = doc(db, 'inquiries', inquiryId)

    await updateDoc(inquiryRef, {
      reply: reply,
    })
  }

  const getUserById = async (userId: string) => {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const date = new Date(data['createdAt'].toDate())
      return User.fromJson({ ...data, ['createdAt']: date, ['id']: userId })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      let doc
      if (lastDoc) {
        doc = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(5))
      } else {
        doc = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(5))
      }
      const documentSnapshots = await getDocs(doc)
      const fetchedInquiries: Inquiry[] = []

      if (!documentSnapshots.empty) {
        for (var i in documentSnapshots.docs) {
          const data = documentSnapshots.docs[i].data()
          const date = new Date(data['createdAt'].toDate())
          const user = await getUserById(data['user'])

          fetchedInquiries.push(new Inquiry(documentSnapshots.docs[i].id, data['title'], data['content'], user!, date, data['reply']))
        }
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
