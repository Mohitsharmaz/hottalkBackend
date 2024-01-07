const mongoose = require("mongoose")

const messageModel = mongoose.Schema({
    content:{type:String}, 
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    chat: {type:mongoose.Schema.Types.ObjectId , ref: "Chat"}
},{
    timestamps: true
})

const Message = mongoose.model("Message", messageModel)

module.exports = Message