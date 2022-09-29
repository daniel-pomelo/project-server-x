const MongoDataBase = require("../MongoDataBase");
const deleteAll = require("./deleteAll");

// <Clans>
// name: string, description: string, created_at: timestamp, disabled: boolean
// -> Contains clan data.
//
// <UserClans>
// user_id: id, clan_id: id
// -> Relationship 1:1 between a clan an his admin.
//
// <UserClanInvitations>
// invitado_id: id, invitador_id: id, clan_id: id,
// status: string, timestamp: timestamp, updated_at: timestamp
// -> Represent an invitation between a clan admin to join.
//
// <UserClanMembers>
// member_id: id, clan_id: id, timestamp: timestamp
// status: string, brokeup_at: timestamp
//
// <ClanRelationships>
//
//

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  await deleteAll(db, "ClanRelationships");
  await deleteAll(db, "Clans");
  await deleteAll(db, "UserClanInvitations");
  await deleteAll(db, "UserClanMembers");
  await deleteAll(db, "UserClans");
  process.exit();
});
