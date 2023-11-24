import { Avatar, Box, Divider, Modal, Typography } from '@mui/material'
import { modalStyle } from '../../routes/meetings'
import User from '../../models/user'

interface UserDetailModalProps {
  user: User
  modalOpen: boolean
  closeModal: () => void
}

export default function UserDetailModal({ user, modalOpen, closeModal }: UserDetailModalProps) {
  return (
    <Modal
      open={modalOpen}
      onClose={() => {
        closeModal()
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ ...modalStyle, overflowY: 'scroll' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            유저 상세
          </Typography>
        </Box>
        <Divider sx={{ mt: 1, bgcolor: 'black' }} />
        <Box display={'flex'} justifyContent={'center'} marginTop={3}>
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Avatar alt={user?.name} src={user?.imageUrl} sx={{ width: 78, height: 78 }} />

            <Box>
              <Typography variant="h5" id="modal-modal-description" sx={{ mt: 2 }}>
                {user?.name}
              </Typography>
            </Box>

            <Box display={'flex'} alignItems={'center'} marginTop={2}>
              <Typography variant="body2" id="modal-modal-description">
                가입일: {user?.createdAt.toISOString().split('T')[0]}
              </Typography>
              <Typography variant="body2" id="modal-modal-description"></Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
