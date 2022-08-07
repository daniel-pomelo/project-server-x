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
  saveUserSkills(skills, user_id, timestamp) {
    return this.save("UserSkills", {
      skills,
      user_id,
      timestamp,
    });
  }
  saveGrowingFactors(data) {
    return this.save("GrowingFactors", data);
  }
  getCharacterGrowingFactor() {
    return this.findNewest("GrowingFactors", {
      type: "character_growing_factor",
    });
  }
  getSkillGrowingFactor() {
    return this.findNewest("GrowingFactors", {
      type: "skill_growing_factor",
    });
  }
  getDefaultStats() {
    return this.findNewest("DefaultStats");
  }
  async registerUserMeterAsPending(userId) {
    const found = await this.findOne("UserMeters", {
      user_id: userId,
    });
    if (!found) {
      return this.save("UserMeters", {
        user_id: userId,
        status: "pending",
        created_at: timestamp(),
      });
    }
  }
  async activeUserMeter(userId) {
    const found = await this.findOne("UserMeters", {
      user_id: userId,
    });
    if (found && found.status === "pending") {
      return this.updateOne(
        "UserMeters",
        {
          user_id: userId,
        },
        { status: "active", active_since: timestamp() }
      );
    } else if (!found) {
      return this.save("UserMeters", {
        user_id: userId,
        status: "active",
        active_since: timestamp(),
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
  async findNewest(collectionName, criteria) {
    const options = {
      sorting: "desc",
      limit: 1,
    };
    const results = await this.find(collectionName, criteria, options);
    return results[0];
  }
  saveUserSkillPointsWithdrawal(points, user_id, timestamp) {
    return this.save("UserSkillPoints", {
      type: "USER_POINTS_WITHDRAWAL",
      points,
      user_id,
      timestamp,
    });
  }
  characterUpdatedFromWeb(userId, systemEvents) {
    this.findUserBridge(userId).then((bridge) => {
      systemEvents.notifyThatUserHasTrained(userId, bridge);
    });
  }
  async findUserBridge(userId) {
    const criteria = {
      user_id: userId,
    };
    const userBridge = await this.findNewest("UserBridges", criteria);
    return this.findOne("Bridges", { id: userBridge.bridge_id });
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
      this.registerError(error);
    }
  }
  async registerError(error) {
    await this.save("Errors", {
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: timestamp(),
    });
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
    const { sorting, limit } = options;

    if (collectionName === "UserSkills") {
      return this.client
        .db("ProjectX")
        .collection(collectionName)
        .find(criteria, { sort: { timestamp: -1 } })
        .toArray();
    }
    if (sorting && sorting === "desc") {
      return this.client
        .db("ProjectX")
        .collection(collectionName)
        .find(criteria, { sort: { timestamp: -1 }, limit })
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
  saveUserPickUpMaterial(userMaterials) {
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
  registerAssignExperience(record) {
    return this.save("UserExperienceRecords", record);
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
