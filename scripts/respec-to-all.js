const MongoDataBase = require("../MongoDataBase");
const throttledQueue = require("throttled-queue");

const throttle = throttledQueue(1, 1000);

MongoDataBase.init().then(async (db) => {
  console.log("****");
  // const enabledUserIds = [];
  // const disabledUsersIds = await db
  //   .find("DisabledUsers")
  //   .then((users) => users.map((disabledUser) => disabledUser.user_id));
  const respecs = await db
    // .find("Users", { id: { $nin: disabledUsersIds } })
    // .find("Users", { id: "fdcd2886-4a08-4a56-bc09-30c5f362817f" })
    .find("Users")
    .then((users) => {
      return Promise.all(
        users.map((user) => {
          return throttle(() => {
            // if (!enabledUserIds.includes(user.id)) {
            //   return console.log(`Skipped user ${user.name}`, new Date());
            // }
            // console.log(`Skipped user ${user.name}`, new Date());
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
