const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, pic, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the fields");
  }

  const userExists = await User.find({ username }).lean();
  console.log("user exists", userExists);
  if (userExists.length) {
    res.status(400);
    throw new Error("Username already taken");
  }

  const user = await User.create({
    username,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User Registration Failed");
  }
});

const authUser = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).send("invalid details");
    }
  } catch (error) {
    console.log("error", error);
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query["search"];
  console.log(req.query);
  let query = keyword
    ? {
        $or: [
          { username: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(query).find({_id:{$ne:req.user._id}})
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
