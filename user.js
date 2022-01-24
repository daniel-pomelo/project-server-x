const MongoDataBase = require("./MongoDataBase");
const InMemoryDataBase = require("./InMemoryDataBase");

class User {
  static from(id, name, breed, type, level_name) {
    return {
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
    };
  }
}

async function findUserById(db, id) {
  const user = await db.findOne("Users", { id });
  if (!user) {
    return null;
  }
  const stats = await getUserStats(db, id);
  return {
    ...user,
    health: user.stats.health,
    mana: user.stats.mana,
    stats,
  };
}

async function saveUser(id, name, breed, type, level_name) {
  const db = MongoDataBase.init();
  const user = User.from(id, name, breed, type, level_name);
  await db.save("Users", user);
  return user;
}
function findAllUser(db) {
  return db.findAll("Users");
}
async function getUserStats(db, id) {
  const props = {
    strength: 0,
    fortitude: 0,
    health: 0,
    intelligence: 0,
    will: 0,
    perception: 0,
    agility: 0,
    endurance: 0,
  };
  if (process.env.ENV_NAME === "dev") {
    return props;
  }
  const userProps = await db.findOne("UsersProps", { user_id: id });
  userProps && delete userProps.user_id;
  userProps && delete userProps._id;
  return {
    ...props,
    ...userProps,
  };
}

module.exports = {
  findUserById,
  findAllUser,
  saveUser,
  getUserStats,
};
