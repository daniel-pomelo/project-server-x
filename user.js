const { MongoClient } = require("mongodb");
const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
const uri = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.jvhhw.mongodb.net/ProjectX?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function findUserById(id) {
  return getCollection("Users", async (usersCollection) => {
    const user = await usersCollection.findOne({ id });

    function asJSONResponse() {
      return user;
    }
    function isRegistered() {
      return !!user;
    }
    function getLinkToRegister() {
      return {
        register_link: "https://project-server-x.herokuapp.com/register/" + id,
      };
    }
    return {
      isRegistered,
      asJSONResponse,
      getLinkToRegister,
    };
  });
}
async function saveUser(id, name, breed, type, level_name) {
  return getCollection("Users", async (usersCollection) => {
    const user = {
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
    await usersCollection.insertOne(user);
  });
}
function getCollection(collectionName, applyFn) {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      const results = await applyFn(
        client.db("ProjectX").collection(collectionName)
      );
      client.close();
      resolve(results);
    });
  });
}
function findAllUser() {
  return getCollection("Users", (usersCollection) => {
    const cursor = usersCollection.find();
    return cursor.toArray();
  });
}

function getUserProps(id) {
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
  return getCollection("UsersProps", async (usersPropsCollection) => {
    const userProps = await usersPropsCollection.findOne({ user_id: id });
    userProps && delete userProps.user_id;
    userProps && delete userProps._id;
    return {
      ...props,
      ...userProps,
    };
  });
}

module.exports = {
  findUserById,
  findAllUser,
  saveUser,
  getUserProps,
};
