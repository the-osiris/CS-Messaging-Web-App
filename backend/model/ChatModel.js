const mongoose = require('mongoose')

const chatSchema = mongoose.Schema(
  {
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        sender: {
          type: String,
          required: true,
        },
        receiver: {
          type: String,
          required: false,
        },
        datetime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    user: mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    }),
    agent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Chats', chatSchema)
