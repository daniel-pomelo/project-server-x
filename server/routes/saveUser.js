const { saveUser } = require("../../user");
const { findBridgeById } = require("../../bridge");
const { sendUserInfoToBridgeUrl } = require("../sendUserInfoToBridgeUrl");

module.exports = async (req, res) => {
  const id = req.params.id;
  const bridgeId = req.headers["bridge-id"];
  const { name, breed, type, level_name } = req.body;

  const user = await saveUser(id, name, breed, type, level_name);

  const bridge = await findBridgeById(bridgeId);

  if (bridge) {
    console.log("BridgeId: ", bridgeId);
    console.log("BridgeURL: ", bridge.url);
    sendUserInfoToBridgeUrl(bridge.url, user);
  } else {
    console.log("Bridge not found: ", bridgeId);
  }

  res.send();
};
