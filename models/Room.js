const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const Room = new Schema({
    room: {type: String}
}, {
    timestamps: true,
});

module.exports = mongoose.model('Room', Room);