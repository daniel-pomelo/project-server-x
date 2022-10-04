const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init({ database: "ProjectX" }).then(async (db) => {
  console.log("****");

  db.client
    .db("ProjectX")
    .collection("Errors")
    .aggregate([
      {
        $group: {
          _id: "$error.message",
          count: { $count: {} },
        },
      },
    ])
    .toArray()
    .then((res) => console.log(JSON.stringify(res, null, 2)))
    .then(() => process.exit());
});
