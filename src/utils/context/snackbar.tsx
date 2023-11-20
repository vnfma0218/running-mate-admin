import { createContext, useContext, useState, ReactNode } from 'react'
import CustomizedSnackbars from '../../components/global/snackbar'
import { TypeAlertModal } from '../constants'

interface SnackbarContextProps {
  showSnackbar: (type: TypeAlertModal) => void
  closeSnackbar: () => void
}

const SnackbarContext = createContext<SnackbarContextProps>({ showSnackbar: (_: TypeAlertModal) => {}, closeSnackbar: () => {} })

interface SnackbarProviderProps {
  children: ReactNode
}

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [alertType, setAlertType] = useState<TypeAlertModal>('meetingDelete')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const showSnackbar = (type: TypeAlertModal) => {
    setAlertType(type)
    setSnackbarOpen(true)
  }

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      {snackbarOpen && (
        <CustomizedSnackbars
          alertType={alertType}
          open={snackbarOpen}
          handleClose={() => {
            setSnackbarOpen(false)
          }}
        />
      )}
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
