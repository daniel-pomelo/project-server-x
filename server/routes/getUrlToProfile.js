const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");
const { assertRequestComesFromBridgeEnabled } = require("../../bridge");
const assertCharacterExists = require("../../assertions/assertCharacterExists");

const getUrlToProfile = (db) => async (req, res) => {
  const id = req.params.id;
  await assertCharacterExists(db, id);
  const bridgeId = req["headers"]["bridge-id"];
  await assertRequestComesFromBridgeEnabled(db, req);
  await db.saveUserAtBridge(id, bridgeId, timestamp());
  const url = await getProfileUrl(id);
  res.send({
    user_id: id,
    url,
  });
};

module.exports = getUrlToProfile;
