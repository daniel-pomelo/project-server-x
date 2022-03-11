const MongoDataBase = require("./MongoDataBase");

MongoDataBase.init().then((db) => {
  db.client
    .db("ProjectX")
    // .collection("UserExperience")
    // .collection("UserPoints")
    // .collection("UserSkillPoints")
    // .collection("UserStats")
    .collection("UsersProps")
    .deleteMany({
      user_id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
      // id: "12f6538d-fea7-421c-97f0-8f86b763ce75",
    })
    .then(console.log)
    .catch(console.log);
});
