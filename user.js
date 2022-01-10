const { MongoClient } = require("mongodb");
const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
const uri = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.jvhhw.mongodb.net/ProjectX?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function findUserById(id) {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      try {
        const user = await client
          .db("ProjectX")
          .collection("Users")
          .findOne({ id });

        client.close();

        function asJSONResponse() {
          return user;
        }
        function isRegistered() {
          return !!user;
        }
        function getLinkToRegister() {
          return {
            register_link:
              "https://project-server-x.herokuapp.com/register/" + id,
            // "http://localhost:3000/register/" + id,
          };
        }
        resolve({
          isRegistered,
          asJSONResponse,
          getLinkToRegister,
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  });
}
async function saveUser(id, name, breed, type, level_name) {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      const result = await client
        .db("ProjectX")
        .collection("Users")
        .insertOne({
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
      resolve(result);
    });
  });
}
function findAllUser() {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      const cursor = client.db("ProjectX").collection("Users").find();
      const results = await cursor.toArray();
      client.close();
      resolve(results);
    });
  });
}

module.exports = {
  findUserById,
  findAllUser,
  saveUser,
};
