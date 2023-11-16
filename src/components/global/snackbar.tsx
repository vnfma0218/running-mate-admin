import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { forwardRef, useEffect } from 'react'
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
  useEffect(() => {
    setTimeout(() => {
      handleClose()
    }, 2000)
  }, [open])

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {SNACKBARS_MESSAGES[alertType].title}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
