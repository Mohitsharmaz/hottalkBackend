const express = require("express")
const protect = require("../middleware/authMiddleware")
const { accessChat, fetchChat, createGroupChat, renameGroup, addInGroup, removeFromGroup } = require("../controllers/chatController")

const router = express.Router()

router.post("/", protect , accessChat)
router.get("/", protect , fetchChat)
router.post("/group", protect , createGroupChat)
router.put("/group/:id", protect , renameGroup)
router.put("/group/:id/remove", protect , removeFromGroup)
router.put("/group/:id/add", protect , addInGroup)

module.exports = router
