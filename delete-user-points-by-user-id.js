const MongoDataBase = require("./MongoDataBase");

MongoDataBase.init().then(async (db) => {
  const myDb = db.client.db("ProjectX");
  const userId = "12f6538d-fea7-421c-97f0-8f86b763ce75";
  const res = await getUserExperienceRecordsByUserId(myDb, userId);
  console.log(res);
  // deleteUserProgressByUserId(myDb, "fdcd2886-4a08-4a56-bc09-30c5f362817f");
});

function getUserExperienceRecordsByUserId(db, userId) {
  return db
    .collection("UserExperienceRecords")
    .find({
      user_id: userId,
    })
    .toArray();
}

function deleteUserProgressByUserId(db, userId) {
  const collections = [
    "UserExperience",
    "UserExperienceRecords",
    "UserPoints",
    "UserSkillPoints",
    "UserStats",
    "UsersProps",
    "UserSkills",
    "UserMeters",
  ];

  const promises = collections.map((collection) => {
    return db.collection(collection).deleteMany({
      user_id: userId,
    });
  });

  return Promise.all(promises).then(console.log);
}

function deleteAll(db, collectionName) {
  return db.collection(collectionName).deleteMany({});
}
