import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignIn from './routes/signIn'
import ErrorPage from './error-page'
import Layout from './components/global/layout'
import UsersPage from './routes/users'
import HomePage from './routes/home'
import NotiePage from './routes/notice'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/notice', element: <NotiePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
