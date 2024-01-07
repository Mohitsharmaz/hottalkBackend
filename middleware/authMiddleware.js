const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers?.authorization?.startsWith("Bearer")
  ) {
    try {
       token = req.headers.authorization.split(" ")[1];
      let decode = jwt.decode(token, 10);
      req.user = await User.findById(decode.id).select("-password");
      next()
    } catch (error) {
        console.log("error is", error)
        next()
    }
  }
  else{
    res.status(401)
    throw new Error("Not authorized, token failed")
  }
});

module.exports = protect
