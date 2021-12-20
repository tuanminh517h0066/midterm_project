const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
let messageBox ;
const scroller = document.querySelector(".conversation");
const fallback = document.querySelector(".fallback");
const notify = document.getElementById('notify');
const window_chat = document.getElementById('window-chat');

let _user = {};
let roomID = "";
const newUserConnected = (user) => {

  _user = user;
  
  socket.emit('new user',user)

};

const addToUsersBox = (user) => {
  if (!!document.querySelector(`.userlist-${user.id}`)) {
    return;
  }

  let tm = new Date();
  let time = tm.getHours()+":"+tm.getMinutes();
  var me = '';

  if(user.id === _user.id) {
    var me = '(you)';
  }


  const userBox = `
    <div class="user chat_ib  userlist-${user.id}" data-id="${user.id}" >
      <div class="row">
        <div class="user-avatar col-lg-3">
          <img src="${user.avatar}">
        </div>
        <div class="user-info col-lg-7">
          <div class="user-name-${user.id}"><strong>${user.name}</strong> ${me}</div>
          <div class="online">Access time: ${time}'</div>
        </div>
        <div class="status col-lg-2">
          <div class="badge badge-success badge-pill">Free</div>
        </div>
      </div>
    </div>
  `;
  
  inboxPeople.innerHTML +=  userBox;

  let htmlnoti = `<div class="alert alert-success d-inline position-fixed small" style="bottom: 20px; left: 20px;" id="notify-${user.id}">
    <strong>${user.name}</strong> recently online
    </div>
  `
  notify.innerHTML += htmlnoti;

  setTimeout("hide_noti('"+ user.id +"')", 2000)
};

function hide_noti(id) {
  $('#notify-'+id).remove();
}
function hide_noti_logout() {
  $('.noti-logout').remove();
}
// new user is created so we generate nickname and emit event
// newUserConnected();

socket.on("new user", function (data) {
  console.log(data);

  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (user) {
  document.querySelector(`.userlist-${user.id}`).remove();
  let htmlnoti = `<div id="offline-notification" class="alert alert-danger d-inline position-fixed small noti-logout" style="bottom: 20px; right: 20px" ">
    <strong>${user.name}</strong> đã thoát khỏi ứng dụng
  </div>`
  notify.innerHTML += htmlnoti;
  setTimeout("hide_noti_logout()", 2000)
});


var className ="";
var classNameList = [];

$(document).on('click','.fa-window-close', function() {
  $('.chat-form').attr("hidden",true);
})

$(document).on('click','.chat_ib', function() {
  var user_id = $(this).data('id');
  console.log("id nguoi nhan:"+ user_id);
  console.log("id nguoi gui:"+ _user.id);
  console.log('check');
  
  $('.chat-form').removeAttr('hidden');
  

  
  $('#receiver_id').val(user_id);

  var username = $('.user-name-'+user_id).text()
  $('.user-name-chat').text(username);


  var tempRoomID = _user.id  +"-"+ user_id;

  console.log('tempRoomID: '+tempRoomID);

  if(roomID === "" ){
    
    roomID = tempRoomID;
    className = "messages__history_" + roomID;
    classNameList.push(className);

    $(".inbox__messages").append(`
      <div class="${className}"</div>
      `);
    messageBox = document.querySelector("."+className);
    console.log("msg: "+ messageBox);
    console.log("classsNName ==: "+ className);
    console.log("user_id ==: "+ user_id);
    console.log("_user.id ==: "+ _user.id);
    console.log("create New");

  }else if(roomID !==  tempRoomID){
    console.log("Diffrence");
    
    if($("div").hasClass(className) == true ){
      $('.'+className).hide();
      console.log("exist");  
    }
    console.log("roomID: ", roomID);

    roomID = tempRoomID;

    className = "messages__history_" + roomID;
    console.log("classsNName !=: "+ className);
    if(jQuery.inArray(className, classNameList) !== -1 ){
      $('.'+className).show();
      console.log("inArray");
    }
    else{
      $('.messages__history').hide();
      $(".inbox__messages").append(`
        <div class="${className}"</div>
        `);
      classNameList.push(className);
      console.log("New again");
    }
    
    messageBox = document.querySelector("."+className);
    console.log("msg: "+ messageBox);
    
  }
  
})


// chat message

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <span class="message__author">${user.name}</span> 
  <div class="message incoming__message">
    ${message}
    <div class="message__info"> </div>
  </div>
  <p class="time_date">${formattedTime}</p>`;

  const myMsg = `
  <div class="message outgoing__message">
    ${message}
  </div>
  <p class="time_date" style="text-align: right;">${formattedTime}</p>`;

  
  messageBox.innerHTML += user.id === _user.id ? myMsg : receivedMsg;
  scroller.scrollTop = scroller.scrollHeight;
};





inputField.addEventListener("keyup", () => {
  var to = $('#receiver_id').val();
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: _user.name,
    to: to,
  });
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }
  
  var to = $('#receiver_id').val();
  console.log("roomID: "+roomID);
  console.log(to);
  if(to === _user.id) {
    addNewMessage({ user: _user, message: inputField.value });
  } else {
    socket.emit("chat message", {
      message: inputField.value,
      user: _user,
      to: to,
      roomID: roomID,
    });
    inputField.focus();
    addNewMessage({ user: _user, message: inputField.value });
  }
  inputField.value = "";
});


socket.on("chat message", function (data) {
  console.log(data);
  console.log('data sent room ID:'+ data.roomID);
  roomID = data.roomID;
  var user_id = data.user.id;
  $('#receiver_id').val(user_id);
  $('.user-name-chat').text(data.user.name);
  
  className = "messages__history_" + roomID;
    
  if(jQuery.inArray(className, classNameList) === -1){
    {
      $(".inbox__messages").append(`
      <div class="${className}"</div>
      `);
      messageBox = document.querySelector("."+className);
      classNameList.push(className);
    }
  }
  $('.chat-form').removeAttr('hidden');
  
  addNewMessage({ user: data.user, message: data.message });

  
});

socket.on("typing", function (data) {
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<span style="padding: 4px 8px;">${nick} is typing...</span>`;
});