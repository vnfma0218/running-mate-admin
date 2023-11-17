import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { ChangeEvent, useEffect, useState } from 'react'
import { db } from '../firebase'
import { OrderByDirection, QueryDocumentSnapshot, collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import User from '../models/user'
import { StyledTableCell, USERS_PER_PAGE } from '../utils/constants'
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { IPageInfo } from './meetings'
import { ArrowDownward } from '@mui/icons-material'

export default function UsersPage() {
  const [searchParams, setSearchParams] = useState({
    input: '',
    sort: 'desc',
  })
  const [savedSearchParams, setSavedSearchParams] = useState({
    input: '',
    sort: 'desc',
  })
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
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
      console.log('pageInfo.curPage', pageInfo.curPage)
      const snapshot = await getCountFromServer(totalCountDoc)
      totalCnt = snapshot.data().count
    } else {
      console.log('pageInfo.curPage', pageInfo.totalCount)
      totalCnt = pageInfo.totalCount
    }
    const documentSnapshots = await getDocs(doc)
    const fetchedUsers = [] as User[]

    if (!documentSnapshots.empty) {
      documentSnapshots.forEach((doc) => {
        const data = doc.data()
        const createdAt = new Date(data['createdAt'].toDate())
        const user = new User(doc.id, data['name'], data['email'], data['imageUrl'], createdAt)
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
                <StyledTableCell align="left">
                  <Typography sx={{ paddingLeft: '5px' }}> 관리</Typography>
                </StyledTableCell>
                <StyledTableCell>가입일</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ width: '200px' }} component="th" scope="row">
                    {user.name}
                  </TableCell>
                  <TableCell sx={{ width: '250px' }}>{user.email}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" color="error">
                      정지
                    </Button>
                  </TableCell>
                  <TableCell>{user.createdAt.toISOString().split('T')[0]}</TableCell>
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
    </>
  )
}
