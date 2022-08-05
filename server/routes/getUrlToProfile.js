const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");
const { assertRequestComesFromBridgeEnabled } = require("../../bridge");

const getUrlToProfile = (db) => async (req, res) => {
  const userId = req.params.id;
  const bridgeId = req["headers"]["bridge-id"];
  await assertRequestComesFromBridgeEnabled(db, bridgeId);
  await db.saveUserAtBridge(userId, bridgeId, timestamp());
  const url = await getProfileUrl(userId);
  res.send({
    url,
  });
};

module.exports = getUrlToProfile;
