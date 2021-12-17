var express = require('express');
const socket = require("socket.io");
var router = express.Router();
const passport = require('passport');
const userMiddleware = require('../middleware/UserMiddleware')
const User = require('../models/User');
const Chat = require('../models/Chat');
const Room = require('../models/Room');

/* GET home page. */
router.get('/', userMiddleware.checkAuthenticated , function(req, res, next) {
  
  user_name = req.user.username;
  user_id = req.user._id;
  user_avatar = req.user.avatar;
  console.log(user_avatar);

  res.render('index', {user: { name: user_name, id:user_id, avatar:user_avatar }});
});


router.post('/chat', userMiddleware.checkAuthenticated, function(req, res, next) {

});

/* GET home page. */
router.get('/login', userMiddleware.checkNotAuthenticated, function(req, res, next) {
  res.render("login", { title: "Login" });
});

router.get('/auth/google', userMiddleware.checkNotAuthenticated ,
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
)); 


router.get( '/auth/google/callback', userMiddleware.checkNotAuthenticated,
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
}));

module.exports = router;
