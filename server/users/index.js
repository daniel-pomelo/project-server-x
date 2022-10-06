const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const findUsers = require("../routes/findUsers");
const getPlayers = require("../routes/getPlayers");
const returnUserById = require("../routes/returnUserById");
const togglePlayer = require("../routes/togglePlayer");

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
};
