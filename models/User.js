const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");


const User = new Schema({
    username: {type: String},
    email: {type: String, required: true},
    password: {type: String},
    avatar: {type: String},
    groupId: {type: String},    
}, {
    timestamps: true,
});

User.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
}

User.methods.validPassword = function(password) {
    
    
   let check = bcrypt.compareSync(password, this.password);
    // console.log(check);
    return check
}

User.methods.validEmail = function(email) {
    
    let regexEmail = "^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(student.tdtu.edu)\.vn$";

    if (email.match(regexEmail)) {
        console.log(1)
        return email;
    } else {
        console.log(2)
    }


}

// User.methods.validPassword = function(password) {
//     return  this.password;
// }

module.exports = mongoose.model('User', User);