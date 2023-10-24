const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const chatRoute = require("./routes/chatRoute");
require("dotenv/config");
const socket = require("socket.io");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY, // This is also the default, can be omitted
});

// const openai = new OpenAIApi(config);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);
app.use("/api/chat", chatRoute);

app.post("/api/gpt", async (req, res) => {
  try {
    const { prompt } = req.body;
    // console.log("GPT entry: " + prompt);

    const data = {
      model: "gpt-3.5-turbo-instruct",
      prompt: "Rewrite this line: " + prompt,
      // n: 3,
      max_tokens: 50,
      temperature: 0,
    };

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + GPT_KEY,
      },
      body: JSON.stringify(data),
    });
    const textRes = await response.json();
    // console.log(textRes);

    // const textRes = { choices: [{ text: "OKAYYY" }] };

    if (textRes.id) {
      res.status(200).json({ success: true, res: textRes.choices[0].text });
    } else res.status(400).json({ success: false, message: textRes });
  } catch (e) {
    console.log("Error in /api/gpt: ", e);
    res.status(500).json({ success: false, error: e });
  }
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to database`);
  })
  .catch((err) => {
    console.log(err.message);
  });

let port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server runnning on port ${port}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
global.chats = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const chatSocket = chats.get(data.id);
    if (chatSocket) {
      chatSocket.forEach((user) => {
        socket.to(user).emit("msg-receive", data.message);
      });
    }
  });

  socket.on("new-request", (data) => {
    chats.set(data._id, [socket.id]);
    socket.broadcast.emit("request-receive", data);
  });

  socket.on("chat-accepted", (data) => {
    let users = chats.get(data);
    if (users === undefined) users = [];
    if (!users.includes(socket.id)) users.push(socket.id);
    chats.set(data, users);
    socket.broadcast.emit("remove-request", data);
    users = chats.get(data);
    users.forEach((user) => {
      io.to(user).emit("chat-started", data);
    });
  });

  socket.on("chat-opened", (chatid) => {
    let users = chats.get(chatid);
    if (users === undefined) users = [];
    if (!users.includes(socket.id)) users.push(socket.id);
    chats.set(chatid, users);
  });

  socket.on("chat-ended", (chatid) => {
    let users = chats.get(chatid);
    if (users === undefined) users = [];
    if (!users.includes(socket.id)) users.push(socket.id);
    chats.set(chatid, users);
    users = chats.get(chatid);
    users.forEach((user) => {
      socket.to(user).emit("chat-complete");
    });
  });

  socket.on("logout", (userId) => {
    onlineUsers.delete(userId);
    socket.emit("disconnected");
  });

  socket.on("error", function (err) {
    console.log(err);
  });
});
