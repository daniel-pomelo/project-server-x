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
    return db.client.db("ProjectX").collection(collection).deleteMany({});
  });

  return Promise.all(promises).then(console.log);
});
