const User = require('../model/UserModel')
const Chat = require('../model/ChatModel')
const bcrypt = require('bcrypt')

module.exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const nameCheck = await User.findOne({ name })
    if (nameCheck) return res.json({ msg: 'Name already used', status: false })
    const emailCheck = await User.findOne({ email })
    if (emailCheck)
      return res.json({ msg: 'Email already used', status: false })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })
    delete user.password
    return res.json({ status: true, user })
  } catch (err) {
    next(err)
  }
}

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user)
      return res.json({ msg: 'Incorrect email or password', status: false })
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid)
      return res.json({ msg: 'Incorrect email or password', status: false })
    delete user.password
    return res.json({ status: true, user })
  } catch (err) {
    next(err)
  }
}

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const allChats = await Chat.find({ agent: { $eq: req.params.id } })
      .select(['user', 'status', 'priority', '_id'])
      .sort({ updatedAt: -1 })
    return res.json({ allChats })
  } catch (err) {
    next(err)
  }
}

module.exports.getUser = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id).select([
      'user',
      'status',
      'priority',
      '_id',
    ])
    return res.json({ chat })
  } catch (err) {
    next(err)
  }
}
