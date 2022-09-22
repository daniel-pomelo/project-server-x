const MongoDataBase = require("../MongoDataBase");
const deleteAll = require("./deleteAll");

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  await deleteAll(db, "ClanRelationships");
  await deleteAll(db, "Clans");
  await deleteAll(db, "UserClanInvitations");
  await deleteAll(db, "UserClanMembers");
  await deleteAll(db, "UserClans");
  process.exit();
});
