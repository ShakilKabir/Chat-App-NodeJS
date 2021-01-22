const users = [];

const addUser = ({ id, username, room }) => {
  username.trim().toLowerCase();
  room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  const checkUser = users.find(
    (user) => user.username === username && user.room === room
  );

  if (checkUser) {
    return {
      error: "the username is taken",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    const user = users.splice(index, 1)[0];
    return user;
  }
  return {
    error: "user not found",
  };
};

// addUser({
//   id: "5",
//   username: "a",
//   room: "b",
// });

const getUser = (id) => {
  return users.find((user) => user.id === id.toString());
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
