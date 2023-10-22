const chatModel = require('../model/ChatModel')
const bcrypt = require('bcrypt')

module.exports.addMessage = async (req, res, next) => {
  try {
    const { id, from, to, message } = req.body
    const msg = {
      message: message,
      sender: from,
      receiver: to,
    }
    const data = await chatModel.findByIdAndUpdate(id, {
      $push: { messages: msg },
    })
    if (data) return res.json({ msg: 'Message added successfully' })
    return res.json({ msg: 'Failed to add message to the database' })
  } catch (err) {
    next(err)
  }
}

module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { id, from } = req.body
    const { messages } = await chatModel
      .findById(id)
      .select(['messages'])
      .sort({ updatedAt: -1 })
    if (messages) {
      const projectMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message,
        }
      })
      return res.json(projectMessages)
    }
  } catch (err) {
    next(err)
  }
}
