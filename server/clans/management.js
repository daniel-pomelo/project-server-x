const asyncHandler = require("../routes/asyncHandler");
const { managementClans, deleteClan } = require("./handlers");

module.exports = {
  management(app, db) {
    app.get("/api/management/clans", asyncHandler(managementClans(db)));
  },
  managementDeleteClan(app, db) {
    app.delete("/api/management/clans/:id", asyncHandler(deleteClan(db)));
  },
};
