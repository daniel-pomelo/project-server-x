const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");

const createConquestPoint = require("./createConquestPoint");
const launchConquestPoint = require("./launchConquestPoint");
const conquerConquestPoint = require("./conquerConquestPoint");

module.exports = {
  conquerConquestPoint: (app, db) => {
    app.post(
      "/api/conquer",
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(conquerConquestPoint(db))
    );
  },
  createConquestPoint: (app, db) => {
    app.post("/api/conquer-point", asyncHandler(createConquestPoint(db)));
  },
  launchConquestPoint: (app, db) => {
    app.post(
      "/api/conquer-point/launch",
      asyncHandler(launchConquestPoint(db))
    );
  },
};
