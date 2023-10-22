const {
  createChat,
  sendMessage,
  getRequests,
  startChat,
  getChat,
  completeChat,
} = require('../controllers/chatsController')

const router = require('express').Router()

router.post('/create/', createChat)
router.post('/getmsg/', sendMessage)
router.get('/getRequests', getRequests)
router.get('/complete/:id', completeChat)
router.post('/start/:id', startChat)
router.get('/:id', getChat)
module.exports = router
