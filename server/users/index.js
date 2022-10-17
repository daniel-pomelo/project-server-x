const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const findUsers = require("../routes/findUsers");
const getPlayers = require("../routes/getPlayers");
const returnUserById = require("../routes/returnUserById");
const togglePlayer = require("../routes/togglePlayer");
const userRespec = require("./userRespec");

module.exports = {
  all: (app, db) => {
    app.get(
      "/api/users",
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(findUsers(db))
    );
  },
  single: (app, db) => {
    app.get(
      "/api/users/:id",
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(returnUserById(db))
    );
  },
  delete: (app, db) => {
    app.delete("/api/users/:id", async (req, res) => {
      const id = req.params.id;
      await db.deleteOne("Users", { id });
      console.log("User of id %s deleted.", id);
      res.send({});
    });
  },
  toggle: (app, db) => {
    app.get("/api/players/:player_id/toggle", asyncHandler(togglePlayer(db)));
  },
  find: (app, db) => {
    app.get("/api/players", getPlayers(db));
  },
  deleteProgress: (app, db) => {
    app.delete("/api/players/:playerId/progress", async (req, res) => {
      const collections = [
        "DisabledUsers",
        "UserExperience",
        "UserExperienceRecords",
        "UserPoints",
        "UserSkillPoints",
        "UserSkills",
        "UserStats",
      ];
      const promises = collections.map((collection) => {
        return db.deleteMany(collection, {
          user_id: req.params.playerId,
        });
      });

      await Promise.all(promises).then(console.log);

      res.send({});
    });
  },
  respec: (app, db) => {
    app.post("/api/respec", asyncHandler(userRespec(db)));
  },
  xp: (app, db) => {
    app.get(
      "/api/users/:userId/xp",
      asyncHandler(async (req, res) => {
        const userId = req.params.userId;
        const users = await db.client
          .db("ProjectX")
          .collection("Users")
          .aggregate([
            { $match: { id: userId } },
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

        console.log(JSON.stringify(userId, null, 2));
        console.log(JSON.stringify(users, null, 2));

        const output = users
          // .sort((a, b) =>
          //   a.experience[0].level_value > b.experience[0].level_value ? -1 : 1
          // )
          .flatMap((user) =>
            Array.from(
              user.experience_records
                .reduce((acc, record) => {
                  //timestamp: 2022-10-13T21:00:37.450Z
                  const hour = record.timestamp.split("T")[1].substring(0, 2);
                  const date = record.timestamp.split("T")[0];
                  // const time = `${date} ${hour}hs`;
                  const time = `${date}:${hour}`;
                  // const time = record.timestamp;
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
            ).reduce((acc, [time, xp]) => {
              return {
                ...acc,
                [time]: xp,
              };
            }, {})
          );
        res.send(output);
      })
    );
  },
};
