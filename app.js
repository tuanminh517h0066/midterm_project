var createError = require('http-errors');
var express = require('express');
var path = require('path');
const socket = require("socket.io");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require("express-session");


var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/web_socket')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

///////////////////////////////
// App setup
const PORT = 5000;
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public/javascripts"));


const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// parse application/json
app.use(express.json())

app.use(require("cookie-parser")("abc-secr"));

app.use(require("express-session")({key:'sessionId'}))

app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport');

//passport

app.use(passport.initialize())
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));





app.use('/', indexRouter);
app.use('/users', usersRouter);


// Socket setup
const io = socket(server);
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware))
io.use(wrap(session({ secret: "cats" })));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));




// io.on("connection", function (socket) {
//   console.log("Made socket connection");
// });
const activeUsers = new Set();
const users = {};

io.on("connection", function (socket) {
  console.log("Made socket connection");
  console.log(socket.id);
  console.log(socket.request.user);
  // if (typeof socket.request.user !== 'undefined') { 
  
  //event new user
  socket.on("new user", function (data) {

    // console.log("data nay la"+ data);
    // console.log(socket.request.user.username)
    // socket.userId = data;
    
    // var user_name = socket.request.user.username;
    // var user_id = socket.request.user._id;
    // var current_user = socket.request.user.username;
    // console.log(user_id);
    // activeUsers[user_id] = user_name

    activeUsers.add(data);

    console.log(activeUsers);


    // users[socket.id] = data._id;

    users[data.id] = socket.id;

    console.log(users);

    // console.log("User", socket.userId, "connected");
    io.emit("new user", [...activeUsers]);
    

    // socket.broadcast.emit('user-connected', [...activeUsers]); 


    
  // }
  });
  //event user disconnect
  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    console.log("User", socket.userId, "disconnected");
    io.emit("user disconnected", socket.userId);
  });
  //event chat
  socket.on("chat message", function (data) {
    console.log(data);
    var anotherSocketId = users[data.to]
    console.log(anotherSocketId)
    data.roomID = data.roomID.split("-")[1] +"-"+ data.roomID.split("-")[0];
    console.log("roomId server: " + data.roomID );
    io.to(anotherSocketId).emit("chat message", data);
  });
  //event typing
  socket.on("typing", function (data) {
    var anotherSocketId = users[data.to];
    socket.to(anotherSocketId).emit("typing", data);
  });
});

////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
