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
}

export default function CustomizedSnackbars({ alertType, open, handleClose }: ISnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        {SNACKBARS_MESSAGES[alertType].title}
      </Alert>
    </Snackbar>
  )
}
