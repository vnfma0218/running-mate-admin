import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { ALERT_MODAL_MESSAGES, TypeAlertModal } from '../../utils/constants'

interface IAlertDialog {
  alertType: TypeAlertModal
  open: boolean
  cancelText?: string
  confirmText?: string
  cancelCbFn: () => void
  confirmCbFn: () => void
}

const AlertDialog = ({ alertType, open, cancelText = '취소', confirmText = '확인', cancelCbFn, confirmCbFn }: IAlertDialog) => {
  return (
    <Dialog open={open} onClose={cancelCbFn} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{ALERT_MODAL_MESSAGES[alertType].title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{ALERT_MODAL_MESSAGES[alertType].content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelCbFn}>{cancelText}</Button>
        <Button onClick={confirmCbFn} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
