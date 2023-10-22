const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const messageRoute = require('./routes/messagesRoute')
const chatRoute = require('./routes/chatRoute')
require('dotenv/config')
const socket = require('socket.io')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', userRoutes)
app.use('/api/messages', messageRoute)
app.use('/api/chat', chatRoute)

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to database`)
  })
  .catch((err) => {
    console.log(err.message)
  })

let port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`Server runnning on port ${port}`)
})

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})

global.onlineUsers = new Map()
global.chats = new Map()

io.on('connection', (socket) => {
  global.chatSocket = socket

  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on('send-msg', (data) => {
    const chatSocket = chats.get(data.id)
    if (chatSocket) {
      chatSocket.forEach((user) => {
        socket.to(user).emit('msg-receive', data.message)
      })
    }
  })

  socket.on('new-request', (data) => {
    chats.set(data._id, [socket.id])
    socket.broadcast.emit('request-receive', data)
  })

  socket.on('chat-accepted', (data) => {
    let users = chats.get(data)
    if (users === undefined) users = []
    if (!users.includes(socket.id)) users.push(socket.id)
    chats.set(data, users)
    socket.broadcast.emit('remove-request', data)
    users = chats.get(data)
    users.forEach((user) => {
      io.to(user).emit('chat-started', data)
    })
  })

  socket.on('chat-opened', (chatid) => {
    let users = chats.get(chatid)
    if (users === undefined) users = []
    if (!users.includes(socket.id)) users.push(socket.id)
    chats.set(chatid, users)
  })

  socket.on('chat-ended', (chatid) => {
    let users = chats.get(chatid)
    if (users === undefined) users = []
    if (!users.includes(socket.id)) users.push(socket.id)
    chats.set(chatid, users)
    users = chats.get(chatid)
    users.forEach((user) => {
      socket.to(user).emit('chat-complete')
    })
  })

  socket.on('logout', (userId) => {
    onlineUsers.delete(userId)
    socket.emit('disconnected')
  })

  socket.on('error', function (err) {
    console.log(err)
  })
})
