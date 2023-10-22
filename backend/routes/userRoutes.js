const {
  register,
  login,
  getAllUsers,
  getUser,
} = require('../controllers/userController')

const router = require('express').Router()

router.post('/register', register)
router.post('/login', login)
router.get('/users/:id', getAllUsers)
router.get('/user/:id', getUser)

module.exports = router
