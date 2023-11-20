import { Box, Button, TextField, Typography } from '@mui/material'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ChangeEvent, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { db } from '../firebase'
import AlertDialog from '../components/global/alertDialog'
import { IModalInfo } from './users'
import CustomizedSnackbars from '../components/global/snackbar'
import { useNavigate } from 'react-router-dom'

export default function NewNoticePage() {
  const navigate = useNavigate()
  const [modalInfo, setModalInfo] = useState<IModalInfo>({
    alertOpen: false,
    alertType: 'newNotice',
    snackbarOpen: false,
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const submitNotice = async () => {
    await addDoc(collection(db, 'notices'), {
      title: title,
      content: content,
      createdAt: serverTimestamp(),
    })
    setModalInfo((prev) => ({ ...prev, alertOpen: false, snackbarOpen: true }))
    setContent('')
    setTitle('')
  }
  const noticeConfirmModal = () => {
    setModalInfo((prev) => ({ ...prev, alertOpen: true }))
  }
  const cancelNoticeConfirmModal = () => {
    setModalInfo((prev) => ({ ...prev, alertOpen: false }))
  }
  const onBackPage = () => {
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
          <Button onClick={noticeConfirmModal} variant="contained">
            등록
          </Button>
        </Box>
      </Box>
      <AlertDialog alertType={modalInfo.alertType} open={modalInfo.alertOpen} cancelCbFn={cancelNoticeConfirmModal} confirmCbFn={submitNotice} />
      <CustomizedSnackbars
        alertType={modalInfo.alertType}
        open={modalInfo.snackbarOpen}
        handleClose={() => {
          setModalInfo((prev) => ({ ...prev, snackbarOpen: false }))
        }}
      />
    </Box>
  )
}
