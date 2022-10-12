const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init().then(async (db) => {
  const requests = await db.client
    .db("ProjectX")
    .collection("Requests")
    .aggregate([
      {
        $group: {
          _id: "$url",
          count: { $count: {} },
        },
      },
    ])
    .toArray();

  const output = requests
    .sort((a, b) => (a.count > b.count ? -1 : 1))
    .map((request) => [request.count, request._id]);

  console.log(JSON.stringify(output, null, 2));

  process.exit();
});
