const assignExperience = require("../routes/assignExperience");
const asyncHandler = require("../routes/asyncHandler");

const URL_XP = "/api/xp";

module.exports = {
  reward: (app, db, systemEvents) => {
    app.post(URL_XP, asyncHandler(assignExperience(db, systemEvents)));
  },
};
