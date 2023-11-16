import { TableCell, styled, tableCellClasses } from '@mui/material'

export const MEETING_PER_PAGE = 3

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[600],
    color: theme.palette.common.white,
  },
}))
