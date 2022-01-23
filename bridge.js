const { MongoClient } = require("mongodb");
const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
const uri = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.jvhhw.mongodb.net/ProjectX?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function saveBridge(id, url) {
  return getCollection("Bridges", async (bridgesCollection) => {
    const bridge = {
      id,
      url,
    };
    await bridgesCollection.updateOne(
      { id },
      { $set: bridge },
      { upsert: true }
    );
  });
}

async function findBridgeById(id) {
  return getCollection("Bridges", async (bridgesCollection) => {
    const bridge = await bridgesCollection.findOne({ id });
    return bridge;
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

module.exports = {
  saveBridge,
  findBridgeById,
};
