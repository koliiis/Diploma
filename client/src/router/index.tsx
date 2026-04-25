import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { ChatsPage } from '../pages/ChatsPage'
import { CoursesPage } from '../pages/CoursesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ProtectedRoute } from './ProtectedRoute'
import { ChatPage } from '../pages/ChatPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'courses',
            element: <CoursesPage />,
          },
          {
            path: 'chats',
            element: <ChatsPage />,
          },
          {
            path: 'chats/:chatId',
            element: <ChatPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
])