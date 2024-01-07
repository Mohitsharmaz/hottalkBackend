const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    email: { type: String, required: true },
    pic: {
      type: String,
      //   required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userModel.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};
userModel.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  // const salt = bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, 10);
  console.log("just before saving...");
  next();
});

const User = mongoose.model("User", userModel);

module.exports = User;
