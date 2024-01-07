const express = require("express")
const protect = require("../middleware/authMiddleware")
const { sendMessage, getChatMessages } = require("../controllers/messageController")

const router = express.Router()

router.post("/:chatId", protect, sendMessage)
router.get("/:chatId", protect , getChatMessages)


module.exports = router