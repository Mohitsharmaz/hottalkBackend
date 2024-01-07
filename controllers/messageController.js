const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = expressAsyncHandler(async (req, res) => {
  try {
    const sender = req.user._id;
    const { content } = req.body;
    const chatId = req.params.chatId;

    if (!content || !chatId) {
      console.log("invalid data passed in request");
      return res.sendStatus(400);
    }
    let messageData = {
      sender,
      content,
      chat: chatId,
    };

    let createMessage = await Message.create(messageData);
    createMessage = await createMessage
      .populate("sender", "name pic")
    createMessage = await createMessage.populate("chat")
    createMessage = await User.populate(createMessage, {
      path: "chat.users",
      select: "name pic email",
    });

    let udpateChat = await Chat.findByIdAndUpdate({_id: chatId}, {latestMessage: createMessage._id},{new: true})

    res.json(createMessage)


  } catch (error) {
    res.status(400)
    throw new Error(error)
  }
});

const getChatMessages = expressAsyncHandler(async (req, res) => {
    try {
        let chatId = req.params.chatId
        let messages = await Message.find({chat: chatId}).populate("sender", "username pic email").populate("chat")
        messages = await Message.populate(messages, {path: "chat.latestMessage", select:"content sender"})
        res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error)
    }
});

module.exports = { sendMessage, getChatMessages };
