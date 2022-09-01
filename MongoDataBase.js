require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
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
  initialize() {
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.connect(async (err) => {
      if (err) {
        console.log("Error: ", err);
      }
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
  findScalingFactors() {
    return this.findOne("ScalingFactors", {});
  }
  async assertUserCreateAClan(userId) {
    const results = await this.find("UserClans", { user_id: userId });
    if (results.length !== 0) {
      throw new Error("User reached clan creation limit.");
    }
  }
  async saveUserClan(clanName, clanDescription, userId) {
    const clan = await this.save("Clans", {
      name: clanName,
      description: clanDescription,
      status: "inactive",
      created_at: timestamp(),
    });
    return this.save("UserClans", {
      clan_id: clan.insertedId,
      user_id: userId,
    });
  }
  async updateScalingFactors(scalingFactors) {
    const firstDocument = await this.findNewest("ScalingFactors");
    return this.updateOne(
      "ScalingFactors",
      {
        _id: firstDocument._id,
      },
      scalingFactors
    );
  }
  async updateDefaultStats(defaultStats) {
    const firstDocument = await this.findNewest("DefaultStats");
    return this.updateOne(
      "DefaultStats",
      {
        _id: firstDocument._id,
      },
      defaultStats
    );
  }
  async inviteToClan(invitadorId, invitadoId) {
    const userClan = await this.findOne("UserClans", { user_id: invitadorId });
    if (!userClan) {
      throw new Error("Invitador doesnt have a clan.");
    }
    const clan = await this.findOne("Clans", {
      _id: userClan.clan_id,
    });
    if (!clan) {
      throw new Error("Clan wasnt found.");
    }
    const member = await this.findOne("UserClanMembers", {
      member_id: invitadoId,
      clan_id: userClan.clan_id,
    });
    if (member && member.status === "brokeup") {
      throw new Error("Invitado left the clan.");
    }
    if (member) {
      throw new Error("Invitado is already a member.");
    }
    const invitation = await this.findOne("UserClanInvitations", {
      invitador_id: invitadorId,
      invitado_id: invitadoId,
      clan_id: userClan.clan_id,
    });
    if (invitation) {
      throw new Error("Invitado is already a invitated.");
    }
    return this.save("UserClanInvitations", {
      invitado_id: invitadoId,
      invitador_id: invitadorId,
      clan_id: userClan.clan_id,
      status: "pending",
      timestamp: timestamp(),
    });
  }
  async leaveClan(clanId, userId) {
    const membership = await this.findOne("UserClanMembers", {
      clan_id: new ObjectId(clanId),
      member_id: userId,
    });
    if (!membership) {
      throw new Error("User membership not found.");
    }
    await this.updateOne(
      "UserClanMembers",
      {
        clan_id: new ObjectId(clanId),
        member_id: userId,
      },
      {
        leave_at: timestamp(),
        status: "brokeup",
      }
    );
  }
  async getClans() {
    const clans = await this.client
      .db("ProjectX")
      .collection("UserClans")
      .aggregate([
        {
          $lookup: {
            from: "Users",
            localField: "user_id",
            foreignField: "id",
            as: "admins",
            pipeline: [
              { $project: { newRoot: { name: "$name" } } },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
        {
          $lookup: {
            from: "Clans",
            localField: "clan_id",
            foreignField: "_id",
            as: "clan_facts",
            pipeline: [
              {
                $project: {
                  newRoot: {
                    name: "$name",
                    type: "basic_data",
                    created_at: "$created_at",
                  },
                },
              },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
        {
          $lookup: {
            from: "UserClanMembers",
            localField: "clan_id",
            foreignField: "clan_id",
            as: "members",
            pipeline: [
              {
                $lookup: {
                  from: "Users",
                  localField: "member_id",
                  foreignField: "id",
                  as: "member",
                  pipeline: [
                    { $project: { newRoot: { name: "$name" } } },
                    { $replaceRoot: { newRoot: "$newRoot" } },
                  ],
                },
              },
            ],
          },
        },
      ])
      .toArray();

    return clans.map((clan) => {
      return {
        id: clan.clan_id,
        admins: clan.admins,
        created_at: clan.clan_facts[0].created_at,
        name: clan.clan_facts[0].name,
        members: clan.members.map((member) => {
          return {
            name: member.member[0].name,
            status: member.status,
          };
        }),
      };
    });
  }
  async joinClan(invitationId, userId) {
    const invitation = await this.findOne("UserClanInvitations", {
      _id: new ObjectId(invitationId),
    });
    if (!invitation) {
      throw new Error("Invitation not found.");
    }
    if (invitation.invitado_id !== userId) {
      throw new Error("Invitation not allowed.");
    }
    if (invitation.status !== "pending") {
      throw new Error(`Invitation is ${invitation.status}.`);
    }
    await this.updateOne(
      "UserClanInvitations",
      {
        _id: new ObjectId(invitationId),
      },
      {
        updated_at: timestamp(),
        status: "accepted",
      }
    );
    await this.joinMemberToClan(userId, invitation.clan_id);
  }
  joinMemberToClan(userId, clanId) {
    const data = {
      member_id: userId,
      clan_id: clanId,
      joined_at: timestamp(),
      status: "active",
    };
    return this.save("UserClanMembers", data);
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
  getSkillsCatalog() {
    return this.find("Skills");
  }
  getUserMeterStatus(userId) {
    return this.findOne("UserMeters", { user_id: userId }).then((userMeter) =>
      userMeter ? userMeter.status : "pending"
    );
  }
  getUserClanDetails(userId) {
    return this.findOne("UserClans", { user_id: userId }).then((userClan) =>
      userClan
        ? this.findOne("Clans", { _id: userClan.clan_id }).then((clan) =>
            clan
              ? this.find("UserClanMembers", {
                  clan_id: new ObjectId(clan._id),
                })
                  .then((memberships) =>
                    Promise.all(
                      memberships.map((membership) =>
                        this.findOne("Users", { id: membership.member_id })
                      )
                    )
                  )
                  .then((members) => ({
                    name: clan.name,
                    description: clan.description,
                    status: clan.status,
                    created_at: clan.created_at,
                    members,
                  }))
              : clan
          )
        : userClan
    );
  }
  async getClanInvitations(userId) {
    const clanInvitations = await this.find("UserClanInvitations", {
      invitado_id: userId,
      status: "pending",
    });
    const invitations = await Promise.all(
      clanInvitations.map(async (clanInvitation) => {
        const clan = await this.findOne("Clans", {
          _id: clanInvitation.clan_id,
        });
        const invitador = await this.findOne("Users", {
          id: clanInvitation.invitador_id,
        });
        if (!clan || !invitador) {
          return false;
        }
        return {
          id: clanInvitation._id,
          invitador: invitador.name,
          clanName: clan.name,
          timestamp: clanInvitation.timestamp,
        };
      })
    );
    return invitations.filter((invitation) => invitation);
  }
  getClanMembership(userId) {
    return this.findOne("UserClanMembers", {
      member_id: userId,
      status: "active",
    }).then((membership) =>
      membership
        ? this.findOne("Clans", { _id: new ObjectId(membership.clan_id) })
        : membership
    );
  }
  async playersWithoutClan() {
    const [users, userClans, membersIds] = await Promise.all([
      this.find("Users"),
      this.find("UserClans").then((userClans) =>
        userClans.map((userClan) => userClan.user_id)
      ),
      this.find("UserClanMembers").then((members) =>
        members.map((member) => member.member_id)
      ),
    ]);
    return users.filter(
      (user) => !membersIds.includes(user.id) && !userClans.includes(user.id)
    );
  }
}

module.exports = MongoDataBase;
