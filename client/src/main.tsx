import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'virtual:uno.css'
import './index.css'
import { router } from './router'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'react-hot-toast'

registerSW({
  immediate: true,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  </React.StrictMode>,
)