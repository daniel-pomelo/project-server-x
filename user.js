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

module.exports = {
  findUserById,
  findAllUser,
  saveUser,
};
