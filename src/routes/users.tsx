import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import User from '../models/user'
import { StyledTableCell } from '../utils/constants'
import { Box, Button, CircularProgress, Typography } from '@mui/material'

export default function UsersPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = [] as User[]
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const user = new User(doc.id, data['name'], data['email'], data['imageUrl'])
      users.push(user)
    })
    setUsers(users)
    setLoading(false)
  }

  return (
    <>
      {loading ? (
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
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" color="error">
                      정지
                    </Button>
                    {/* <Button sx={{ ml: 1 }} size="small" variant="contained" color="error">
                      삭제
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
