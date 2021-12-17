const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const Chat = new Schema({
    message: {type: String},
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    from_member_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    to_member_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },    
}, {
    timestamps: true,
});

module.exports = mongoose.model('Chat', Chat);