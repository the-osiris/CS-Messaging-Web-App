import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Request from './pages/Request'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/request' element={<Request />} />
        <Route path='/' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
