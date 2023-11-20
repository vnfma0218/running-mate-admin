import { Box, Button, TextField, Typography } from '@mui/material'
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ChangeEvent, useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { db } from '../firebase'
import AlertDialog from '../components/global/alertDialog'
import { IModalInfo } from './users'
import { useNavigate, useParams } from 'react-router-dom'
import Notice from '../models/notice'
import { useSnackbar } from '../utils/context/snackbar'
import { TypeAlertModal } from '../utils/constants'

export default function NewNoticePage() {
  const navigate = useNavigate()
  const params = useParams()
  const { showSnackbar } = useSnackbar()

  const [modalInfo, setModalInfo] = useState<IModalInfo>({
    alertOpen: false,
    alertType: 'newNotice',
    snackbarOpen: false,
  })

  const [notice, setNotice] = useState<Notice | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const getNoticeDetail = async () => {
      const docRef = doc(db, 'notices', params.id!)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        const notice = Notice.fromJson({ ...data, ['id']: params.id })
        setNotice(notice)
        setTitle(notice.title)
        setContent(notice.content)
      } else {
        // docSnap.data() will be undefined in this case
      }
    }
    if (params.id != 'new') {
      getNoticeDetail()
    }
  }, [])

  const submitNotice = async () => {
    const data = {
      title: title,
      content: content,
      createdAt: notice ? notice.createdAt : serverTimestamp(),
    }
    if (notice) {
      await setDoc(doc(db, 'notices', notice.id), data)
    } else {
      await addDoc(collection(db, 'notices'), data)
    }
    setModalInfo((prev) => ({ ...prev, alertOpen: false }))
    showSnackbar(modalInfo.alertType)
    setContent('')
    setTitle('')
    navigate(-1)
  }
  const noticeConfirmModal = (alertType: TypeAlertModal) => {
    setModalInfo((prev) => ({ ...prev, alertType: alertType, alertOpen: true }))
  }
  const cancelNoticeConfirmModal = () => {
    setModalInfo((prev) => ({ ...prev, alertType: 'deleteNotice', alertOpen: false }))
  }
  const onBackPage = () => {
    navigate(-1)
  }

  const deleteNotice = async () => {
    console.log('notice.id', notice!.id)
    await deleteDoc(doc(db, 'notices', notice!.id))
    setModalInfo((prev) => ({ ...prev, alertOpen: false }))
    showSnackbar(modalInfo.alertType)
    navigate(-1)
  }

  return (
    <Box
      component="main"
      style={{ padding: '10px' }}
      sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]),
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        mt: 10,
      }}
    >
      <Box sx={{ width: '60%', margin: '0 auto' }}>
        <Typography>제목</Typography>
        <TextField
          sx={{ mt: 1, mb: 2 }}
          id="outlined-size-small"
          fullWidth
          size="small"
          label="제목을 입력해주세요"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value)
          }}
        />
        <Typography sx={{ mb: 1 }}>본문</Typography>

        <ReactQuill placeholder="본문 내용을 입력해주세요" theme="snow" value={content} onChange={setContent} />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'end' }}>
          <Button sx={{ mr: 1 }} onClick={onBackPage}>
            목록
          </Button>
          {notice ? (
            <Button onClick={() => noticeConfirmModal('deleteNotice')} variant="contained" color="error" sx={{ mr: 1 }}>
              삭제
            </Button>
          ) : null}

          <Button onClick={() => noticeConfirmModal(notice ? 'updateNotice' : 'newNotice')} variant="contained">
            {notice ? '수정' : '등록'}
          </Button>
        </Box>
      </Box>
      <AlertDialog
        alertType={modalInfo.alertType}
        open={modalInfo.alertOpen}
        cancelCbFn={cancelNoticeConfirmModal}
        confirmCbFn={() => {
          if (modalInfo.alertType === 'deleteNotice') {
            deleteNotice()
          } else {
            submitNotice()
          }
        }}
      />
    </Box>
  )
}
