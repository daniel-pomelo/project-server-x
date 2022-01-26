const { MongoClient } = require("mongodb");
const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
const uri = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.jvhhw.mongodb.net/ProjectX?retryWrites=true&w=majority`;

class MongoDataBase {
  constructor(client) {
    this.client = client;
  }
  static init() {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return new MongoDataBase(client);
  }
  findOne(collectionName, criteria) {
    return new Promise((resolve) => {
      this.client.connect(async (err) => {
        if (err) {
          return reject(err);
        }
        const results = await this.client
          .db("ProjectX")
          .collection(collectionName)
          .findOne(criteria);
        resolve(results);
        this.client.close();
      });
    });
  }
  findAll(collectionName) {
    return new Promise((resolve) => {
      this.client.connect(async (err) => {
        if (err) {
          return reject(err);
        }
        const cursor = this.client
          .db("ProjectX")
          .collection(collectionName)
          .find();
        const results = await cursor.toArray();
        resolve(results);
        this.client.close();
      });
    });
  }
  async save(collectionName, data) {
    await new Promise((r) => {
      this.client.connect(async (err) => {
        if (err) {
          return reject(err);
        }
        await this.client
          .db("ProjectX")
          .collection(collectionName)
          .insertOne(data);
        this.client.close();
        r();
      });
    });
  }
  updateOne(collectionName, criteria, document) {
    return this.client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      await this.client.db("ProjectX").collection(collectionName).updateOne(
        criteria,
        {
          $set: document,
        },
        { upsert: true }
      );
      this.client.close();
    });
  }
}

module.exports = MongoDataBase;
