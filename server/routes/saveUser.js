const { saveUser } = require("../../user");
const { sendUserInfoToBridgeUrl } = require("../sendUserInfoToBridgeUrl");

module.exports = (bridges) => async (req, res) => {
  const id = req.params.id;
  const { name, breed, type, level_name } = req.body;

  const user = await saveUser(id, name, breed, type, level_name);

  const bridgeId = "ESTE_ES_EL_BRIDGE_ID";
  const bridge = bridges.get(bridgeId);

  if (bridge) {
    console.log("BridgeId: ", bridgeId);
    console.log("BridgeURL: ", bridge.bridge_url);
    sendUserInfoToBridgeUrl(bridge.bridge_url, user);
  }

  res.send();
};
