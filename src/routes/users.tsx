import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { ChangeEvent, useEffect, useState } from 'react'
import { db } from '../firebase'
import { OrderByDirection, QueryDocumentSnapshot, collection, doc, getCountFromServer, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import User from '../models/user'
import { StyledTableCell, TypeAlertModal, USERS_PER_PAGE, UserStatus } from '../utils/constants'
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { IPageInfo } from './meetings'
import { ArrowDownward } from '@mui/icons-material'
import AlertDialog from '../components/global/alertDialog'
import CustomizedSnackbars from '../components/global/snackbar'
import useModalInfo from '../hooks/useModal'

export interface IModalInfo {
  alertOpen: boolean
  alertType: TypeAlertModal
  snackbarOpen: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User>()
  const [loading, setLoading] = useState(false)
  const { modalInfo, openAlert, closeAlert, openSnackbar, closeSnackbar } = useModalInfo({ alertType: 'userDelete' })

  const [searchParams, setSearchParams] = useState({
    input: '',
    sort: 'desc',
  })
  const [savedSearchParams, setSavedSearchParams] = useState({
    input: '',
    sort: 'desc',
  })

  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    totalCount: 0,
    curPage: 1,
    hasMore: false,
  })
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [pageInfo.curPage, savedSearchParams])

  const fetchUsers = async () => {
    setLoading(true)

    const { doc, totalCountDoc } = queryMethod()
    let totalCnt = 0
    if (pageInfo.curPage === 1) {
      const snapshot = await getCountFromServer(totalCountDoc)
      totalCnt = snapshot.data().count
    } else {
      totalCnt = pageInfo.totalCount ?? 0
    }
    const documentSnapshots = await getDocs(doc)
    const fetchedUsers = [] as User[]

    if (!documentSnapshots.empty) {
      documentSnapshots.forEach((doc) => {
        const data = doc.data()
        const createdAt = new Date(data['createdAt'].toDate())
        const user = new User(doc.id, data['name'], data['email'], data['imageUrl'], createdAt, data['status'] ?? UserStatus.normal)
        fetchedUsers.push(user)
      })
    }
    const allUsers = pageInfo.curPage === 1 ? fetchedUsers : [...users, ...fetchedUsers]

    setUsers(allUsers)
    setPageInfo((prev) => ({ ...prev, totalCount: totalCnt, hasMore: allUsers.length < totalCnt }))

    const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
    setLastDoc(lastVisible)
    setLoading(false)
  }

  const queryMethod = () => {
    let doc
    let totalCountDoc
    if (searchParams.input.length) {
      if (lastDoc) {
        doc = query(collection(db, 'users'), where('name', '>=', searchParams.input), where('name', '<=', searchParams.input + '\uf8ff'), startAfter(lastDoc), limit(USERS_PER_PAGE))
      } else {
        doc = query(collection(db, 'users'), where('name', '>=', searchParams.input), where('name', '<=', searchParams.input + '\uf8ff'), limit(USERS_PER_PAGE))
      }
      totalCountDoc = query(collection(db, 'users'), where('name', '>=', searchParams.input), where('name', '<=', searchParams.input + '\uf8ff'))
    } else {
      if (lastDoc) {
        doc = query(collection(db, 'users'), orderBy('createdAt', searchParams.sort as OrderByDirection), startAfter(lastDoc), limit(USERS_PER_PAGE))
      } else {
        doc = query(collection(db, 'users'), orderBy('createdAt', searchParams.sort as OrderByDirection), limit(USERS_PER_PAGE))
      }
      totalCountDoc = query(collection(db, 'users'), orderBy('createdAt', searchParams.sort as OrderByDirection))
    }
    return { doc, totalCountDoc }
  }

  const onNextData = () => {
    setPageInfo((prev) => ({ ...prev, curPage: prev.curPage + 1 }))
  }

  const onChangeInput = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, input: value }))
  }
  const onChangeSort = (event: SelectChangeEvent<unknown>) => {
    setSearchParams((prev) => ({ ...prev, sort: event.target.value as string }))
  }
  const saveSearchParam = () => {
    setLastDoc(null)
    setSavedSearchParams({ ...searchParams })
    setPageInfo((prev) => ({ ...prev, curPage: 1 }))
  }

  const onDeleteConfirmModalClose = () => {
    closeAlert()
  }

  const onDeleteConfirmModalShow = (selectedUser: User) => {
    setSelectedUser(selectedUser)
    openAlert(selectedUser.status === UserStatus.normal ? 'userDelete' : 'userOpen')
  }

  const onToggleUserStatus = async () => {
    const userRef = doc(db, 'users', selectedUser!.id)
    const changedStatus = selectedUser?.status === UserStatus.normal ? UserStatus.stop : UserStatus.normal
    await updateDoc(userRef, {
      status: changedStatus,
    })
    setUsers((prev) => {
      const changedUser = prev.find((user) => user.id === selectedUser!.id)
      changedUser!.status = changedStatus
      return prev
    })
    closeAlert()
    openSnackbar()
  }

  return (
    <>
      <Box sx={{ mb: 2, padding: '1rem', border: '1px solid #ebebeb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField id="outlined-size-small" size="small" label="닉네임" onChange={onChangeInput} />
          <FormControl sx={{ m: 1, minWidth: 120, ml: 2 }} size="small">
            <InputLabel id="demo-select-small-label">정렬</InputLabel>
            <Select labelId="demo-select-small-label" id="demo-select-small" label="정렬" value={searchParams.sort} onChange={onChangeSort}>
              <MenuItem value={'desc'}>최신순</MenuItem>
              <MenuItem value={'asc'}>오래된순</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={saveSearchParam} sx={{ padding: '0.25rem 1.5rem' }} variant="contained">
            검색
          </Button>
        </Box>
      </Box>
      {loading && pageInfo.curPage === 1 ? (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>닉네임</StyledTableCell>
                <StyledTableCell>이메일</StyledTableCell>
                <StyledTableCell>가입일</StyledTableCell>
                <StyledTableCell>상태</StyledTableCell>
                <StyledTableCell align="left">
                  <Typography sx={{ paddingLeft: '5px' }}> 관리</Typography>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ width: '200px' }} component="th" scope="row">
                    {user.name}
                  </TableCell>
                  <TableCell sx={{ width: '250px' }}>{user.email}</TableCell>
                  <TableCell>{user.createdAt.toISOString().split('T')[0]}</TableCell>
                  <TableCell>{user.status === UserStatus.normal ? '정상' : '정지'}</TableCell>
                  <TableCell>
                    <Button onClick={() => onDeleteConfirmModalShow(user)} size="small" variant="contained" color="error">
                      {user.status === UserStatus.normal ? '정지' : '정지해제'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageInfo.hasMore ? (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={onNextData}>
            <Typography>더보기</Typography>
            <ArrowDownward />
          </Button>
        </Box>
      ) : null}
      <AlertDialog alertType={modalInfo.alertType} open={modalInfo.alertOpen} cancelCbFn={onDeleteConfirmModalClose} confirmCbFn={onToggleUserStatus} />
      <CustomizedSnackbars
        alertType={modalInfo.alertType}
        open={modalInfo.snackbarOpen}
        handleClose={() => {
          closeSnackbar()
          // setModalInfo((prev) => ({ ...prev, snarbarOpen: false }))
        }}
      />
    </>
  )
}
