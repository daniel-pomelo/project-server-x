const users = new Map();

async function findUserById(id) {
  const user = await users.get(id);

  function asJSONResponse() {
    return user;
  }
  function isRegistered() {
    return !!user;
  }
  function getLinkToRegister() {
    return {
      register_link: "https://project-server-x.herokuapp.com/register/" + id,
      // "http://localhost:3000/register/" + id,
    };
  }
  return {
    isRegistered,
    asJSONResponse,
    getLinkToRegister,
  };
}
async function saveUser(id, name, breed, type, level_name) {
  users.set(id, {
    id,
    name,
    breed,
    type,
    level_name,
    level_value: 1,
    stats: {
      health: 100,
      mana: 100,
    },
  });
}
async function findAllUser() {
  return Array.from(users.values());
}

module.exports = {
  findUserById,
  findAllUser,
  saveUser,
};
