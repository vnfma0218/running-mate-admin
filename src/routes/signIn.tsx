import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { useNavigate } from 'react-router-dom'
import { AuthErrorCodes, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.ts'
import { useEffect, useState } from 'react'

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

export default function SignIn() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/')
      }
    })
    return () => {
      listen()
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email') as string
    const password = data.get('password') as string
    signInWithEmailAndPassword(auth, email!, password!)
      .then((auth) => {
        if (auth) {
          console.log(auth)
          navigate('/')
        }
      })
      .catch((err) => {
        const errMsg = authErrMsg(err.code)
        setError(errMsg)
      })
  }

  const authErrMsg = (code: string) => {
    switch (code) {
      case 'auth/invalid-login-credentials':
        return '이메일 혹은 비밀번호가 일치하지 않습니다.'
      case 'auth/user-not-found' || 'auth/wrong-password':
        return '이메일 혹은 비밀번호가 일치하지 않습니다.'
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.'
      case 'auth/weak-password':
        return '비밀번호는 6글자 이상이어야 합니다.'
      case 'auth/network-request-failed':
        return '네트워크 연결에 실패 하였습니다.'
      case 'auth/invalid-email':
        return '잘못된 이메일 형식입니다.'
      case 'auth/internal-error':
        return '잘못된 요청입니다.'
      default:
        return '로그인에 실패 하였습니다.'
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          로그인
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="이메일" name="email" autoComplete="email" autoFocus />
          <TextField margin="normal" required fullWidth name="password" label="비밀번호" type="password" id="password" autoComplete="current-password" />
          <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="저장하기" />

          {error ? (
            <Typography component="body" variant="body2" color={'red'} sx={{ mt: 2 }}>
              {error}
            </Typography>
          ) : null}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            로그인
          </Button>
          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */}
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  )
}
