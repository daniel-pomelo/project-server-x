const MongoDataBase = require("./MongoDataBase");

MongoDataBase.init().then(async (db) => {
  const myDb = db.client.db("ProjectX");
  // doShit(myDb)
  const res = await deleteAll(myDb);
  console.log(res);
});

function deleteAll(db) {
  return db.collection("UserExperienceRecords").deleteMany({});
}

async function doShit(db) {
  const records = await db.find({
    user_id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
  });

  console.log(JSON.stringify(records, null, 2));
}

function deleteUser(db) {
  const collections = [
    "UserExperience",
    "UserPoints",
    "UserSkillPoints",
    "UserStats",
    "UsersProps",
    "UserSkills",
    "UserMeters",
  ];

  const promises = collections.map((collection) => {
    return db.collection(collection).deleteMany({
      user_id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
    });
  });

  return Promise.all(promises).then(console.log);

  // db.client
  //   .db("ProjectX")
  //   .collection("UserBridges")
  //   .deleteMany({})
  //   .then(() => process.exit());
}
