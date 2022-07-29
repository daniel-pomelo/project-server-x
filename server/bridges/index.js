const asyncHandler = require("../routes/asyncHandler");
const listBridges = require("../routes/listBridges");
const saveBridge = require("../routes/saveBridge");
const saveBridges = require("../routes/saveBridges");
const toggleBridge = require("../routes/toggleBridge");

module.exports = {
  update: (app, db) => {
    app.post("/api/bridge", saveBridge(db));
  },
  save: (app, db) => {
    app.post("/api/bridges", saveBridges(db));
  },
  list: (app, db) => {
    app.get("/api/bridges", listBridges(db));
  },
  toggle: (app, db) => {
    app.get("/api/bridges/:bridge_id/toggle", asyncHandler(toggleBridge(db)));
  },
};
