const { getPlayerToken } = require("../../auth");
const { timestamp } = require("../../time");

const getUrlToProfile = (db) => async (req, res) => {
  const bridgeId = req["headers"]["bridge-id"];
  console.log(req["headers"]);
  const userId = req.params.id;
  await db.save("UserBridges", {
    user_id: userId,
    bridge_id: bridgeId,
    timestamp: timestamp(),
  });
  console.log(`Save { user_id: ${userId}, bridge_id: ${bridgeId} }`);
  const url = await getPlayerToken(userId);
  res.send({
    url,
  });
};

module.exports = getUrlToProfile;
