require("dotenv").config();
const { MongoClient } = require("mongodb");
const { timestamp } = require("./time");
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
    return new Promise((resolve, reject) => {
      client.connect(async (err) => {
        if (err) {
          return reject(err);
        }
        resolve(new MongoDataBase(client));
      });
    });
  }
  deleteOne(collectionName, criteria) {
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .deleteOne(criteria);
  }
  findOne(collectionName, criteria) {
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .findOne(criteria);
  }
  findAll(collectionName) {
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .find()
      .toArray();
  }
  save(collectionName, data) {
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .insertOne(data);
  }
  async registerUserMeterAsPending(userId) {
    const found = await this.findOne("UserMeters", {
      user_id: userId,
    });
    if (!found) {
      return this.save("UserMeters", {
        user_id: userId,
        status: "pending",
        timestamp: timestamp(),
      });
    }
  }
  updateInvitationTimestamp(invitation, timestamp) {
    return this.updateOne(
      "Invitations",
      {
        invitador: invitation.invitador,
        invitado: invitation.invitado,
      },
      { invitado_at: timestamp }
    );
  }
  async findUserBridge(userId) {
    const { bridge_id } = await this.findOne("UserBridges", {
      user_id: userId,
    });
    return this.findOne("Bridges", { id: bridge_id });
  }
  async saveUserAtBridge(userId, bridgeId, timestamp) {
    const data = {
      user_id: userId,
      bridge_id: bridgeId,
      timestamp,
    };
    try {
      await this.updateOne(
        "UserBridges",
        {
          user_id: userId,
        },
        data
      );
      console.log(`Saved ${JSON.stringify(data)}`);
    } catch (error) {
      console.log(
        `Error Saving ${JSON.stringify(data)}, due: ${error.message}`
      );
      await this.save("Errors", {
        collection: "UserBridges",
        error: {
          message: error.message,
          stack: error.stack,
        },
        timestamp,
      });
    }
  }
  updateOne(collectionName, criteria, document) {
    return this.client.db("ProjectX").collection(collectionName).updateOne(
      criteria,
      {
        $set: document,
      },
      { upsert: true }
    );
  }
  find(collectionName, criteria, options = {}) {
    const { sorting } = options;
    if (collectionName === "UserSkills") {
      return this.client
        .db("ProjectX")
        .collection(collectionName)
        .find(criteria)
        .sort({ timestamp: -1 })
        .toArray();
    }
    if (sorting && sorting === "desc") {
      return this.client
        .db("ProjectX")
        .collection(collectionName)
        .find(criteria)
        .sort({ timestamp: -1 })
        .toArray();
    }
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .find(criteria)
      .toArray();
  }
  async groupByUserId(collectionName, userIds) {
    const documents = await this.find(collectionName, {
      user_id: { $in: userIds },
    });
    return documents.reduce((acc, document) => {
      acc[document.user_id] = document;
      return acc;
    }, {});
  }
  savePickUpMaterials(userMaterials) {
    return this.save("UserMaterials", userMaterials);
  }
  async saveUserExperience(collectionName, operations) {
    operations = operations.map(({ isFirstAssignment, newUserExperience }) => {
      if (isFirstAssignment) {
        return { insertOne: { document: newUserExperience } };
      } else {
        return {
          updateOne: {
            filter: { user_id: newUserExperience.user_id },
            update: { $set: newUserExperience },
            upsert: true,
          },
        };
      }
    });
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .bulkWrite(operations);
  }
  registerAssignExperience(experienceToAssign, timestamp) {
    return this.save("UserExperienceRecords", {
      experiences: experienceToAssign,
      timestamp,
    });
  }
  saveUserPoints(operations) {
    operations = operations.map((operation) => {
      return { insertOne: { document: operation } };
    });
    return this.client
      .db("ProjectX")
      .collection("UserPoints")
      .bulkWrite(operations);
  }
  saveUserSkillPoints(operations) {
    operations = operations.map((operation) => {
      return { insertOne: { document: operation } };
    });
    return this.client
      .db("ProjectX")
      .collection("UserSkillPoints")
      .bulkWrite(operations);
  }
}

module.exports = MongoDataBase;
