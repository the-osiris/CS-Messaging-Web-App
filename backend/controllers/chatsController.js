const chatModel = require('../model/ChatModel')
const userModel = require('../model/UserModel')

module.exports.createChat = async (req, res, next) => {
  try {
    const { user, message, priority, agent } = req.body
    const data = await chatModel.create({
      messages: [{ sender: user.name, message: message, receiver: agent }],
      user: user,
      agent: agent,
      status: 'pending',
      priority: priority,
    })
    if (data) {
      data.messages[0].sender = data.user.id
      await chatModel.findByIdAndUpdate(data._id, { messages: data.messages })
      return res.json({ status: true, chat: data })
    }
    return res.json({ status: false })
  } catch (err) {
    next(err)
  }
}

module.exports.getRequests = async (req, res, next) => {
  try {
    const requests = await chatModel
      .find({ agent: { $exists: false } })
      .select(['messages', 'user', 'priority', '_id', 'createdAt'])
      .sort({ updatedAt: 1 })
    return res.json({ requests })
  } catch (err) {
    next(err)
  }
}

module.exports.completeChat = async (req, res, next) => {
  try {
    const requests = await chatModel.findByIdAndUpdate(req.params.id, {
      status: 'complete',
    })
    return res.json({ requests })
  } catch (err) {
    next(err)
  }
}

module.exports.startChat = async (req, res, next) => {
  try {
    const request = await chatModel.findOne({
      _id: req.params.id,
      agent: { $exists: false },
    })
    if (request) {
      request.messages.forEach((message) => {
        message.receiver = req.body.agent
      })
      const { name } = await userModel.findById(req.body.agent).select(['name'])
      const tempMsg = {
        message: `${name} has joined the chat`,
        sender: req.body.agent,
        receiver: request.user._id,
      }
      request.messages.push(tempMsg)
      await chatModel.findByIdAndUpdate(req.params.id, {
        agent: req.body.agent,
        messages: request.messages,
      })
      return res.json({ status: true })
    }
    return res.json({ status: false })
  } catch (err) {
    console.log(err.message)
    next(err)
  }
}

module.exports.getChat = async (req, res, next) => {
  try {
    const chat = await chatModel.findById(req.params.id)
    if (chat) {
      return res.json({ status: true, chat: chat })
    }
    return res.json({ status: false })
  } catch (err) {
    console.log(err.message)
    next(err)
  }
}

module.exports.sendMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body
    const data = await chatModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    })
    if (data) return res.json({ msg: 'Message added successfully' })
    return res.json({ msg: 'Failed to add message to the database' })
  } catch (err) {
    next(err)
  }
}

module.exports.getMessages = async (req, res, next) => {
  try {
    const { user, agent, requester } = req.body
    const chat = await chatModel
      .findOne({ $and: [{ agent: agent }, { user: user }] })
      .sort({ updatedAt: -1 })

    const projectMessages = chat.messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === requester,
        message: msg.message,
      }
    })
    return res.json(projectMessages)
  } catch (err) {
    next(err)
  }
}
