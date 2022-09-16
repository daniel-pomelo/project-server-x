const { assertRequestComesFromBridgeEnabled } = require("../../bridge");

module.exports = (db) => async (req, res, next) => {
  await assertRequestComesFromBridgeEnabled(db, req);
  next();
};
