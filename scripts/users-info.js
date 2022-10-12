const MongoDataBase = require("../MongoDataBase");

MongoDataBase.init().then(async (db) => {
  const users = await db.client
    .db("ProjectX")
    .collection("Users")
    .aggregate([
      { $match: { id: "4f1e1283-da0f-4051-9493-9f944c294b57" } },
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
    .flatMap(
      (user, index) =>
        // (user, index) => [
        // `#${index + 1}: ${user.name} Level: ${user.experience[0].level_value}`,
        Array.from(
          user.experience_records
            .reduce((acc, record) => {
              //timestamp: 2022-10-13T21:00:37.450Z
              const hour = record.timestamp.split("T")[1].substring(0, 2);
              const date = record.timestamp.split("T")[0];
              const time = `${date} ${hour}hs`;
              const key = time;
              if (acc.get(key)) {
                const xp = acc.get(key) + record.xp;
                acc.set(key, Math.round(xp));
              } else {
                acc.set(key, Math.round(record.xp));
              }
              return acc;
            }, new Map())
            .entries()
        ).map(([time, xp]) => {
          // return `${time} ${xp}`;
          return { time, xp };
        })
      // .join("\n"),
      // ]
      // ].join("\n")
    );

  console.log(JSON.stringify(output, null, 2));
  // console.log(output.join("\n"));

  process.exit();
});
