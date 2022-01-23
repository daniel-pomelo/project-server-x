const { saveUser } = require("../../user");
const { findBridgeById } = require("../../bridge");
const { sendUserInfoToBridgeUrl } = require("../sendUserInfoToBridgeUrl");
const InMemoryDataBase = require("../../InMemoryDataBase");
const MongoDataBase = require("../../MongoDataBase");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const db =
      process.env.ENV_NAME === "dev"
        ? InMemoryDataBase.init()
        : MongoDataBase.init();
    const attempt = await db.findOne("RegisterAttempts", { userId: id });
    console.log("attempt: ", attempt);
    const bridgeId = attempt.bridgeId;
    const { name, breed, type, level_name } = req.body;

    const user = await saveUser(id, name, breed, type, level_name);

    const bridge = await findBridgeById(bridgeId);

    if (bridge) {
      sendUserInfoToBridgeUrl(bridge.url, user);
    } else {
      console.log("Bridge not found: " + bridgeId);
      res.status(500).send({ message: "Bridge not found: " + bridgeId });
    }

    res.send();
  } catch (error) {
    console.log(error);
  }
};
