import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import MuiDrawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'

import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { LocationCity, LogoutRounded, MeetingRoom, NoMeetingRoom, People } from '@mui/icons-material'

interface ISideMenu {
  text: string
  path: string
  icon: () => JSX.Element
  title: () => JSX.Element
  desc: () => JSX.Element
}

const SIDE_MENUS: ISideMenu[] = [
  {
    text: '대쉬보드',
    icon: () => <DashboardIcon />,
    path: '/',
    title: () => <Typography sx={{ mt: 2 }}>대쉬보드</Typography>,
    desc: () => <Typography></Typography>,
  },
  {
    text: '회원관리',
    icon: () => <PeopleIcon />,
    path: '/users',
    title: () => <Typography sx={{ mt: 2 }}>회원관리</Typography>,
    desc: () => <Typography sx={{ mt: 1, mb: 3, fontSize: '14px' }}>러닝메이트의 회원을 관리합니다.</Typography>,
  },
  {
    text: '모임관리',
    icon: () => <LocationCity />,
    path: '/meetings',
    title: () => <Typography sx={{ mt: 2 }}>모임관리</Typography>,
    desc: () => <Typography sx={{ mt: 1, mb: 3, fontSize: '14px' }}>러닝메이트의 모임을 관리합니다.</Typography>,
  },
  {
    text: '공지관리',
    icon: () => <PeopleIcon />,
    path: '/notice',
    title: () => <Typography sx={{ mt: 2 }}>회원관리</Typography>,
    desc: () => <Typography sx={{ mt: 1, mb: 3, fontSize: '14px' }}>러닝메이트의 회원을 관리합니다.</Typography>,
  },
]

const drawerWidth: number = 240

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}))

const defaultTheme = createTheme()

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [curMenu, setCurMenu] = useState<ISideMenu | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
        navigate('/login')
      }
    })
    return () => {
      listen()
    }
  }, [])

  useEffect(() => {
    const currentMenu = SIDE_MENUS.find((menu) => menu.path === location.pathname)

    setCurMenu(currentMenu ? currentMenu : null)
  }, [location.pathname])

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const selectMenu = (path: string) => {
    navigate(path)
  }

  const onLogout = () => {
    signOut(auth).then(() => {
      navigate('/login')
    })
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              러닝메이트
            </Typography>
            <IconButton color="inherit" onClick={onLogout}>
              {/* <Badge badgeContent={4} color="secondary"> */}
              {/* <NotificationsIcon /> */}
              {/* </Badge> */}
              <LogoutRounded />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {SIDE_MENUS.map((menu) => {
              // console.log('location.pathname: ', location.pathname)
              const isActive = menu.path === location.pathname
              return (
                <ListItemButton key={menu.path} onClick={() => selectMenu(menu.path)}>
                  <ListItemIcon>{menu.icon()}</ListItemIcon>
                  <ListItemText disableTypography primary={<Typography style={{ color: isActive ? '#007FFF' : '' }}>{menu.text}</Typography>} />
                </ListItemButton>
              )
            })}
            {/* <Divider sx={{ my: 1 }} /> */}
          </List>
        </Drawer>
        <Box
          component="main"
          style={{ padding: '10px' }}
          sx={{
            backgroundColor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]),
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          {curMenu ? curMenu.title() : null}
          {curMenu ? curMenu.desc() : null}
          {/* <Typography sx={{ mt: 2 }}>회원관리</Typography>
          <Typography sx={{ mt: 1, mb: 3, fontSize: '14px' }}>러닝메이트의 회원을 관리합니다.</Typography> */}

          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
