const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new Error("UserId param is not sent with");
    return res.status(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [{ users: { $eq: req.user._id } }, { users: { $eq: userId } }],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "pic email username",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("latestMessage");
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChat = expressAsyncHandler(async (req, res) => {
  try {
    let userId = req.user._id;
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: userId } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(chats);
  } catch (error) {
    res.send(error);
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "missing fields" });
  }

  let users = req.body.users;
  users.push(req?.user?._id);

  if (users.length < 2) {
    return res.status(400).send("A group should have atleast 2 Users");
  }

  try {
    let chatData = {
      name: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    };

    const groupChat = await Chat.create(chatData);
    let fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");
    fullGroupChat = await User.populate(fullGroupChat, {
      path: "latestMessage",
      select: "username email pic",
    });

    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  try {
    let groupId = req.params.id;

    let { name } = req.body;

    let updatedChat = await Chat.findByIdAndUpdate(
      { _id: groupId },
      { name },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(updatedChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const addInGroup = expressAsyncHandler(async (req, res) => {
  try {
    let groupId = req.params.id;

    let { userId } = req.body;

    let group = await Chat.findByIdAndUpdate(
      { _id: groupId },
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(400).send(group);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
const removeFromGroup = expressAsyncHandler(async (req, res) => {
    try {
        let groupId = req.params.id;
    
        let { userId } = req.body;
    
        let group = await Chat.findByIdAndUpdate(
          { _id: groupId },
          { $pull: { users: userId } },
          { new: true }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");
        res.status(400).send(group);
      } catch (error) {
        res.status(400).send(error.message);
      }
});

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addInGroup,
  removeFromGroup,
};
