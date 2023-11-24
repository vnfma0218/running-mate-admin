import { useState } from 'react'
import { TypeAlertModal } from '../utils/constants'

interface IModalState {
  modalOpen: boolean
  alertOpen: boolean
  alertType: TypeAlertModal
  snackbarOpen: boolean
  snackbarMessge: string
}

export default function useModalInfo({ alertType }: { alertType: TypeAlertModal }) {
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
  const openAlert = (type?: TypeAlertModal) => {
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
  const changeAlertType = (type: TypeAlertModal) => {
    setModalInfo((prev) => ({ ...prev, alertType: type }))
  }

  return { modalInfo, openModal, closeModal, openAlert, closeAlert, openSnackbar, closeSnackbar, changeAlertType }
}
