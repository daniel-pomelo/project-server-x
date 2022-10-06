require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const filterExMembers = require("./core/filterExMembers");
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
  deleteMany(collectionName, criteria) {
    return this.client
      .db("ProjectX")
      .collection(collectionName)
      .deleteMany(criteria);
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
  async userFunctionalClans(userId) {
    const userClans = await this.find("UserClans", {
      user_id: userId,
      deleted_at: null,
    });
    const userClanIds = userClans.map((userClan) => userClan.clan_id);
    return this.find("Clans", {
      _id: { $in: userClanIds.map((id) => new ObjectId(id)) },
      status: { $ne: "disabled" },
    });
  }
  async saveUserClan(clanName, clanDescription, userId) {
    const clan = await this.save("Clans", {
      name: clanName,
      description: clanDescription,
      created_at: timestamp(),
      status: "inactive",
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
    const userClan = await this.findOne("UserClans", {
      user_id: invitadorId,
      deleted_at: null,
    });
    if (!userClan) {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "MASTER_DOES_NOT_HAVE_A_CLAN";
      e.payload = {
        query: {
          user_id: invitadorId,
          deleted_at: null,
        },
        params: {
          master_id: invitadorId,
          disciple_id: invitadoId,
        },
      };
      throw e;
    }
    const clan = await this.findOne("Clans", {
      _id: userClan.clan_id,
    });
    if (!clan) {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "CLAN_NOT_FOUND";
      e.payload = {
        query: {
          _id: userClan.clan_id,
        },
      };
      throw e;
    }
    const member = await this.getClanMembership(invitadoId);
    if (member && member.status === "brokeup") {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "USER_HAS_LEFT_CLAN_IN_THE_PAST";
      e.payload = {
        member,
      };
      throw e;
    }
    if (member) {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "USER_IS_ALREADY_A_MEMBER";
      e.payload = {
        member,
      };
      throw e;
    }
    const userHasClan = await this.findOne("UserClans", {
      user_id: invitadoId,
      deleted_at: null,
    });
    if (userHasClan) {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "USER_HAS_A_CLAN";
      e.payload = {
        invitador: invitadorId,
        invitado: invitadoId,
      };
      throw e;
    }
    const invitation = await this.findOne("UserClanInvitations", {
      invitador_id: invitadorId,
      invitado_id: invitadoId,
      status: "pending",
      clan_id: userClan.clan_id,
    });
    if (invitation) {
      const e = new Error("BAD_REQUEST");
      e.context = "INVITING_USER_TO_MY_CLAN";
      e.reason = "DISCIPLE_IS_ALREADY_INVITED";
      e.payload = {
        invitation,
      };
      throw e;
    }
    return this.save("UserClanInvitations", {
      invitado_id: invitadoId,
      invitador_id: invitadorId,
      clan_id: userClan.clan_id,
      status: "pending",
      timestamp: timestamp(),
    });
  }
  async leaveClan(userId) {
    const membership = await this.findOne("UserClanMembers", {
      member_id: userId,
      status: "joined",
    });
    if (!membership) {
      const e = new Error("BAD_REQUEST");
      e.context = "LEAVING_CLAN";
      e.reason = "USER_HAS_NO_MEMBERSHIP";
      e.payload = {
        member_id: userId,
      };
      throw e;
    }
    await this.updateOne(
      "UserClanMembers",
      {
        member_id: userId,
        status: "joined",
      },
      {
        brokeup_at: timestamp(),
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
                    status: "$status",
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
        deleted_at: clan.deleted_at,
        deleted_by: clan.deleted_by,
        created_at: clan.clan_facts[0].created_at,
        name: clan.clan_facts[0].name,
        status: clan.clan_facts[0].status,
        members: clan.members
          .filter((member) => member.member.length > 0)
          .map((member) => {
            return {
              name: member.member[0] && member.member[0].name,
              status: member.status,
            };
          }),
      };
    });
  }
  async acceptClanInvitation(invitationId, userId) {
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
    return invitation;
  }
  async joinClan(invitationId, userId, numberOfMembersToActivate) {
    const invitation = await this.acceptClanInvitation(invitationId, userId);
    await this.joinMemberToClan(userId, invitation.clan_id);
    const members = await this.tryToActivateClan(
      invitation.clan_id,
      numberOfMembersToActivate
    );
    return members;
  }
  async tryToActivateClan(clanId, numberOfMembersToActivate) {
    const members = await this.find("UserClanMembers", {
      clan_id: clanId,
      status: "joined",
    });
    if (members.length >= numberOfMembersToActivate) {
      const upsert = false;
      await this.updateOne(
        "Clans",
        {
          _id: new ObjectId(clanId),
          status: "inactive",
        },
        {
          status: "active",
          activated_at: timestamp(),
        },
        upsert
      );
      return members;
    }
    return [];
  }
  async assertIsAlreadyAMember(userId) {
    const memberships = await this.find("UserClanMembers", {
      member_id: userId,
      status: "joined",
    });
    if (memberships.length > 0) {
      const e = new Error("BAD_REQUEST");
      e.context = "JOINING_MEMBER_TO_MY_CLAN";
      e.reason = "DISCIPLE_IS_ALREADY_A_JOINED_MEMBER";
      e.payload = {
        query: {
          member_id: userId,
          status: "joined",
        },
        memberships,
      };
      throw e;
    }
  }
  async joinMemberToClan(userId, clanId) {
    await this.assertIsAlreadyAMember(userId);
    const data = {
      member_id: userId,
      clan_id: clanId,
      timestamp: timestamp(),
      status: "joined",
    };
    return this.save("UserClanMembers", data);
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
  async findNewest(collectionName, criteria, customOptions = {}) {
    const options = {
      sorting: "desc",
      limit: 1,
      ...customOptions,
    };
    const results = await this.find(collectionName, criteria, options);
    if (options.limit === 1) {
      return results[0];
    }
    return results;
  }
  saveUserSkillPointsWithdrawal(points, user_id, timestamp) {
    return this.save("UserSkillPoints", {
      type: "USER_POINTS_WITHDRAWAL",
      points,
      user_id,
      timestamp,
    });
  }
  async findUserBridge(userId) {
    const criteria = {
      user_id: userId,
    };
    const userBridge = await this.findNewest("UserBridges", criteria);
    if (userBridge) {
      return this.findOne("Bridges", { id: userBridge.bridge_id });
    }
    const bridges = await this.find("Bridges");
    if (bridges.length === 1) {
      return bridges[0];
    }
    await this.save("Alerts", {
      timestamp: timestamp(),
      context: "Failure at finding bridge to update user info",
      payload: {
        user_id: userId,
      },
    });
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
    } catch (error) {
      error.context = "SAVING_USER_BRIDGES";
      error.reason = error.message;
      error.payload = {
        data,
      };
      this.registerError(error);
    }
  }
  async registerError(error, requestId) {
    await this.save("Errors", {
      request_id: requestId,
      context: error.context || "MISSING_CONTEXT",
      reason: error.reason || "MISSING_REASON",
      payload: error.payload || {},
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: timestamp(),
    });
  }
  async setRequestLog(requestData) {
    return this.save("Requests", {
      ...requestData,
      timestamp: timestamp(),
    });
  }
  updateOne(collectionName, criteria, document, upsert = true) {
    return this.client.db("ProjectX").collection(collectionName).updateOne(
      criteria,
      {
        $set: document,
      },
      { upsert }
    );
  }
  updateMany(collectionName, criteria, document, upsert = true) {
    return this.client.db("ProjectX").collection(collectionName).updateMany(
      criteria,
      {
        $set: document,
      },
      { upsert }
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
  giveUserSkillPointTo(userId) {
    return this.save("UserSkillPoints", {
      user_id: userId,
      points: 1,
      type: "USER_REGISTER_REWARD",
      timestamp: timestamp(),
    });
  }
  getSkillsCatalog() {
    return this.find("Skills");
  }
  async getUserClanDetails(userId) {
    const userClans = await this.userFunctionalClans(userId);
    const result = await Promise.resolve(userClans[0]).then((clan) =>
      clan
        ? this.find(
            "UserClanMembers",
            {
              clan_id: new ObjectId(clan._id),
            },
            {
              sorting: "asc",
            }
          )
            .then((memberships) =>
              Promise.all(
                filterExMembers(memberships).map((membership) =>
                  this.findOne("Users", { id: membership.member_id }).then(
                    (user) => {
                      return user
                        ? {
                            name: user.name,
                            breed: user.breed,
                            type: user.type,
                            level_name: user.level_name,
                            level_value: user.level_value,
                            status: membership.status,
                          }
                        : false;
                    }
                  )
                )
              )
            )
            .then((members) => ({
              name: clan.name,
              description: clan.description,
              status: clan.status,
              created_at: clan.created_at,
              members: members.filter((member) => member !== false),
            }))
        : clan
    );
    return result;
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
  getClanOfUser(userId) {
    return this.findOne("UserClans", {
      user_id: userId,
      deleted_at: null,
    }).then((userClan) => {
      if (!userClan) {
        return null;
      }
      return this.findOne("Clans", {
        _id: new ObjectId(userClan.clan_id),
      });
    });
  }
  getClanOfJoinedMember(userId) {
    return this.findOne("UserClanMembers", {
      member_id: userId,
      status: "joined",
    }).then((membership) => {
      return membership
        ? this.findOne("Clans", {
            _id: new ObjectId(membership.clan_id),
          })
        : membership;
    });
  }
  getClanMembership(userId) {
    return this.findOne("UserClanMembers", {
      member_id: userId,
      status: "joined",
    }).then((membership) => {
      return membership
        ? this.findOne("UserClans", {
            clan_id: new ObjectId(membership.clan_id),
            deleted_at: null,
          }).then((userClan) => {
            return userClan ? this.getUserClanDetails(userClan.user_id) : null;
          })
        : null;
    });
  }
  async playersWithoutClan() {
    const [users, userClans, membersIds] = await Promise.all([
      this.find("Users"),
      this.find("UserClans", { deleted_at: null }).then((userClans) =>
        userClans.map((userClan) => userClan.user_id)
      ),
      this.find(
        "UserClanMembers",
        {},
        {
          sorting: "desc",
        }
      )
        .then((memberships) => filterExMembers(memberships))
        .then((members) => members.map((member) => member.member_id)),
    ]);
    return users.filter(
      (user) => !membersIds.includes(user.id) && !userClans.includes(user.id)
    );
  }
  async getClanRelationships(userId) {
    const userClan = await this.findOne("UserClans", { user_id: userId });
    if (!userClan) {
      return {
        allies: [],
        enemies: [],
      };
    }
    const relationships = await this.client
      .db("ProjectX")
      .collection("ClanRelationships")
      .aggregate([
        {
          $lookup: {
            from: "Clans",
            localField: "target_clan_id",
            foreignField: "_id",
            as: "target_clan",
            pipeline: [
              {
                $project: {
                  newRoot: {
                    name: "$name",
                  },
                },
              },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
      ])
      .toArray();
    const allies = relationships.filter(
      (relationship) => relationship.type === "Ally"
    );
    const enemies = relationships.filter(
      (relationship) => relationship.type === "Enemy"
    );
    return {
      allies: allies.map((relationship) => {
        return {
          name: relationship.target_clan[0].name,
        };
      }),
      enemies: enemies.map((relationship) => {
        return {
          name: relationship.target_clan[0].name,
        };
      }),
    };
  }
  getInvitations() {
    return this.client
      .db("ProjectX")
      .collection("Invitations")
      .aggregate([
        { $sort: { timestamp: -1 } },
        {
          $lookup: {
            from: "Users",
            localField: "invitador",
            foreignField: "id",
            as: "invitador_data",
            pipeline: [
              { $project: { newRoot: { name: "$name" } } },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
        {
          $lookup: {
            from: "Users",
            localField: "invitado",
            foreignField: "id",
            as: "invitado_data",
            pipeline: [
              { $project: { newRoot: { name: "$name" } } },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
      ])
      .toArray();
  }
  async deleteClan(id) {
    await this.updateOne(
      "Clans",
      {
        _id: new ObjectId(id),
      },
      {
        status: "disabled",
      }
    );
  }
  async getClanInvitationsSent(userId) {
    return this.client
      .db("ProjectX")
      .collection("UserClanInvitations")
      .aggregate([
        { $match: { invitador_id: userId } },
        {
          $lookup: {
            from: "Users",
            localField: "invitado_id",
            foreignField: "id",
            as: "invitado",
            pipeline: [
              { $project: { newRoot: { name: "$name" } } },
              { $replaceRoot: { newRoot: "$newRoot" } },
            ],
          },
        },
      ])
      .toArray()
      .then((invitationsRaw) => {
        return invitationsRaw
          .filter((invitationRaw) => invitationRaw.invitado.length > 0)
          .map((invitationRaw) => {
            return {
              discipleName: invitationRaw.invitado[0].name,
              timestamp: invitationRaw.timestamp,
              status: invitationRaw.status,
            };
          });
      });
  }
  async adminPutClanDown(userId) {
    const userClan = await this.findOne("UserClans", {
      user_id: userId,
      deleted_at: null,
    });
    if (!userClan) {
      const e = new Error("BAD_REQUEST");
      e.context = "PUTTING_CLAN_DOWN";
      e.reason = "USER_DOESNT_HAVE_A_CLAN_TO_PUT_DOWN";
      e.payload = {
        user_id: userId,
      };
      throw e;
    }
    const upsert = false;
    await Promise.all([
      this.updateOne(
        "UserClans",
        { _id: userClan._id },
        {
          deleted_at: timestamp(),
          deleted_by: userId,
          status: "deleted",
        },
        upsert
      ),
      this.updateOne(
        "Clans",
        { _id: new ObjectId(userClan.clan_id) },
        {
          deleted_at: timestamp(),
          deleted_by: userId,
          status: "deleted",
        },
        upsert
      ),
      this.updateMany(
        "UserClanMembers",
        { clan_id: userClan.clan_id },
        {
          status: "deleted",
          deleted_at: timestamp(),
          deleted_by: userId,
        },
        upsert
      ),
    ]);
    return this.find("UserClanMembers", { clan_id: userClan.clan_id });
  }
}

module.exports = MongoDataBase;
