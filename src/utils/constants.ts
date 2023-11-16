import { TableCell, styled, tableCellClasses } from '@mui/material'

export const MEETING_PER_PAGE = 3

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[600],
    color: theme.palette.common.white,
  },
}))

export type TypeAlertModal = 'meetingDelete' | 'userDelete'
export type TypeSnackbar = 'delete' | 'userDelete'

type IAlertModalMessages = {
  [key in TypeAlertModal]: {
    title: string
    content: string
  }
}
type ISnackbarsMessages = {
  [key in TypeAlertModal]: {
    title: string
  }
}

export const ALERT_MODAL_MESSAGES: IAlertModalMessages = {
  meetingDelete: {
    title: '정지',
    content: '해당 게시글을 정지합니다. 진행하시곘습니까?',
  },
  userDelete: {
    title: '삭제',
    content: '삭제하면 복구할 수 없습니다. 진행하시곘습니까?',
  },
}
export const SNACKBARS_MESSAGES: ISnackbarsMessages = {
  meetingDelete: {
    title: '해당 게시글을 정지하였습니다.',
  },
  userDelete: {
    title: '삭제',
  },
}
