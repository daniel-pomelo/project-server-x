const MongoDataBase = require("./MongoDataBase");
const { getSkills } = require("./skills");

MongoDataBase.init().then(async (db) => {
  const { skills, stats } = await getSkills(
    db,
    "fdcd2886-4a08-4a56-bc09-30c5f362817f"
  );

  console.log(stats);
  console.log(skills);
});
