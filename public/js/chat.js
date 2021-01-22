const socket = io();
const form = document.querySelector(".messageForm");
const input = document.querySelector(".messageInput");
const button = document.querySelector(".messageButton");
const sendLocation = document.querySelector("#sendLocation");
const dynamicMessage = document.querySelector("#dynamicMessage").innerHTML;
const locationMessage = document.querySelector("#locationMessage").innerHTML;
const sidebarList = document.querySelector("#sidebar-template").innerHTML;
const insertHere = document.querySelector("#message");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const autoscroll = () => {
  // New message element
  const $newMessage = insertHere.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = insertHere.offsetHeight;

  // Height of messages container
  const containerHeight = insertHere.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = insertHere.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    insertHere.scrollTop = insertHere.scrollHeight;
  }
};

socket.on("message", (text) => {
  const html = Mustache.render(dynamicMessage, {
    username: text.username,
    text: text.text,
    createdAt: moment(text.createdAt).format("h:mm a"),
  });
  insertHere.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (data) => {
  const html = Mustache.render(locationMessage, {
    username: data.username,
    location: data.url,
    createdAt: moment(data.createdAt).format("h:mm a"),
  });
  insertHere.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", (room, users) => {
  const html = Mustache.render(sidebarList, {
    users,
    room,
  });
  document.querySelector(".chat__sidebar").innerHTML = html;
  console.log(room, users);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  button.disabled = true;
  socket.emit("sendMessage", input.value, (data) => {
    button.disabled = false;
    input.value = "";
    input.focus();
    if (data) {
      return console.log(data);
    }
    console.log("delivered");
  });
});

sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Sharing location isn't supported by your browser");
  }
  sendLocation.disabled = true;
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocation.disabled = false;

        console.log("location shared");
      }
    );
  });
});
