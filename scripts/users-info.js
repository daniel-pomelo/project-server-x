const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init().then(async (db) => {
  const users = await db.client
    .db("ProjectX")
    .collection("Users")
    .aggregate([
      // { $match: { id: "4f1e1283-da0f-4051-9493-9f944c294b57" } },
      {
        $lookup: {
          from: "UserExperience",
          localField: "id",
          foreignField: "user_id",
          as: "experience",
        },
      },
      {
        $lookup: {
          from: "UserExperienceRecords",
          localField: "id",
          foreignField: "user_id",
          as: "experience_records",
        },
      },
    ])
    .toArray();

  const output = users
    .sort((a, b) =>
      a.experience[0].level_value > b.experience[0].level_value ? -1 : 1
    )
    .map((user, index) =>
      [
        `#${index + 1}: ${user.name} Level: ${user.experience[0].level_value}`,
        Array.from(
          user.experience_records
            .reduce((acc, record) => {
              const date = record.timestamp.split("T")[0];
              if (acc.get(date)) {
                acc.set(date, acc.get(date) + record.xp);
              } else {
                acc.set(date, record.xp);
              }
              return acc;
            }, new Map())
            .entries()
        ).join("\n"),
      ].join("\n")
    );

  // console.log(JSON.stringify(users, null, 2));
  console.log(output.join("\n"));

  process.exit();
});
