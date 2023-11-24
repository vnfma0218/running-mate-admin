import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { forwardRef } from 'react'
import { SNACKBARS_MESSAGES, TypeAlertModal } from '../../utils/constants'

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

interface ISnackbarProps {
  alertType: TypeAlertModal
  open: boolean
  handleClose: () => void
  message?: string
}

export default function CustomizedSnackbars({ alertType, open, handleClose, message }: ISnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        {message ? message : SNACKBARS_MESSAGES[alertType].title}
      </Alert>
    </Snackbar>
  )
}
