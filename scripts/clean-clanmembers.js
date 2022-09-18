const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  await db.client
    .db("ProjectX")
    .collection("UserClanMembers")
    .deleteMany({})
    .then(console.log);
  await db.client
    .db("ProjectX")
    .collection("UserClanInvitations")
    .deleteMany({})
    .then(console.log);
  process.exit();
});
