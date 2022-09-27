const MongoDataBase = require("../MongoDataBase");
const deleteAll = require("./deleteAll");

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  const collectionsToClean = process.argv[2].split(",");
  const cleanCollection = (collectionName) =>
    deleteAll(db, collectionName).then((result) => ({
      collectionName,
      result,
    }));
  await Promise.all(collectionsToClean.map(cleanCollection)).then(console.log);
  process.exit();
});
