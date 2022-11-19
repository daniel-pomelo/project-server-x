const MongoDataBase = require("../MongoDataBase");
const throttledQueue = require("throttled-queue");
const { timestamp } = require("../time");

const throttle = throttledQueue(1, 1000);

MongoDataBase.init().then(async (db) => {
  console.log("****");
  // const enabledUserIds = [];
  // const disabledUsersIds = await db
  //   .find("DisabledUsers")
  //   .then((users) => users.map((disabledUser) => disabledUser.user_id));
  const respecs = await db
    // .find("Users", { id: { $nin: disabledUsersIds } })
    // .find("Users", { id: "138e87f7-33e7-4240-9e95-1f18f9ff1227" })
    .find("Users")
    .then((users) => {
      return Promise.all(
        users.map((user) => {
          return throttle(async () => {
            // if (!enabledUserIds.includes(user.id)) {
            //   return console.log(`Skipped user ${user.name}`, new Date());
            // }
            // console.log(`Skipped user ${user.name}`, new Date());
            // const userId = user.id;

            // const respec = await db.save("UserRespecs", {
            //   user_id: userId,
            //   type: "WITHDRAWAL",
            //   timestamp: timestamp(),
            // });

            // const upsert = false;
            // const promises = [
            //   db.updateMany(
            //     "UserPoints",
            //     {
            //       user_id: userId,
            //       type: "USER_POINTS_WITHDRAWAL",
            //     },
            //     {
            //       respec_updated_at: timestamp(),
            //       status: "invalidated_by_respec",
            //       respec_id: respec.insertedId,
            //     },
            //     upsert
            //   ),
            //   db.updateMany(
            //     "UserSkillPoints",
            //     {
            //       user_id: userId,
            //       type: "USER_POINTS_WITHDRAWAL",
            //     },
            //     {
            //       respec_updated_at: timestamp(),
            //       status: "invalidated_by_respec",
            //       respec_id: respec.insertedId,
            //     },
            //     upsert
            //   ),
            //   db.updateMany(
            //     "UserSkills",
            //     {
            //       user_id: userId,
            //     },
            //     {
            //       respec_updated_at: timestamp(),
            //       status: "invalidated_by_respec",
            //       respec_id: respec.insertedId,
            //     },
            //     upsert
            //   ),
            //   db.updateMany(
            //     "UserStats",
            //     {
            //       user_id: userId,
            //     },
            //     {
            //       respec_updated_at: timestamp(),
            //       status: "invalidated_by_respec",
            //       respec_id: respec.insertedId,
            //     },
            //     upsert
            //   ),
            // ];

            // return Promise.all(promises)
            //   .then((result) => {
            //     console.log(`Respec to user ${user.name}.`, new Date());
            //     return result;
            //   })
            //   .catch(() => {
            //     return {
            //       type: "FAILED",
            //       user_id: user.id,
            //     };
            //   });
            return db
              .save("UserRespecs", {
                type: "REWARD",
                user_id: user.id,
              })
              .then((result) => {
                console.log(
                  `Rewarded user ${user.name} with 1 respec.`,
                  new Date()
                );
                return result;
              })
              .catch(() => {
                return {
                  type: "FAILED",
                  user_id: user.id,
                };
              });
          });
        })
      );
    })
    .then(() => {
      process.exit();
    });

  console.log(JSON.stringify("Result", null, 2));
  console.log(JSON.stringify(respecs, null, 2));
});
