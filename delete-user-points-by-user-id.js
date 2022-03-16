const MongoDataBase = require("./MongoDataBase");

MongoDataBase.init().then((db) => {
  const collections = [
    "UserExperience",
    "UserPoints",
    "UserSkillPoints",
    "UserStats",
    "UsersProps",
    "UserSkills",
  ];

  const promises = collections.map((collection) => {
    return db.client.db("ProjectX").collection(collection).deleteMany({
      user_id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
    });
  });

  return Promise.all(promises).then(console.log);
});
