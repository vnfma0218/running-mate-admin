import { TableCell, styled, tableCellClasses } from '@mui/material'

export const MEETING_PER_PAGE = 3
export const USERS_PER_PAGE = 5

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[600],
    color: theme.palette.common.white,
  },
}))

export type TypeAlertModal = 'meetingDelete' | 'meetingOpen' | 'userDelete' | 'userOpen' | 'newNotice'
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

export enum MeetingStatus {
  normal = 1,
  stop,
}
export enum UserStatus {
  normal = 1,
  stop,
}

export const ALERT_MODAL_MESSAGES: IAlertModalMessages = {
  meetingDelete: {
    title: '정지',
    content: '해당 게시글을 정지합니다. 진행하시곘습니까?',
  },
  meetingOpen: {
    title: '정지해제',
    content: '해당 게시글을 정지를 해제합니다. 진행하시곘습니까?',
  },
  userDelete: {
    title: '정지',
    content: '해당 유저를 정지합니다. 진행하시곘습니까?',
  },
  userOpen: {
    title: '정지해제',
    content: '해당 유저를 정지를 해제합니다. 진행하시곘습니까?',
  },
  newNotice: {
    title: '공지등록',
    content: '공지를 등록합니다. 진행하시곘습니까?',
  },
}
export const SNACKBARS_MESSAGES: ISnackbarsMessages = {
  meetingDelete: {
    title: '해당 게시글을 정지하였습니다.',
  },
  meetingOpen: {
    title: '해당 게시글의 정지가 해제되었습니다.',
  },
  userDelete: {
    title: '해당 유저의 계정을 정지하였습니다.',
  },
  userOpen: {
    title: '해당 유저의 계정을 정지가 해제되었습니다.',
  },
  newNotice: {
    title: '공지 사항을 등록하였습니다.',
  },
}
