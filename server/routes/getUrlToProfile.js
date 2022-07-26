const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");

const assertRequestComesFromBridgeEnabled = async (db, bridgeId) => {
  const bridge = await db.findOne("Bridges", { id: bridgeId });
  if (!bridge || !bridge.enabled) {
    throw new Error("Bridge invalid");
  }
  return bridge;
};

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
