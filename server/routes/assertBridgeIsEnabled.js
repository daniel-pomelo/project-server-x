const assertBridgeIsEnabled = (db) => async (req, res, next) => {
  const id = req["headers"]["bridge-id"];
  const bridge = await db.findOne("Bridges", { id });
  if (!bridge || !bridge.enabled) {
    throw new Error("Bridge invalid");
  }
  next();
};

module.exports = assertBridgeIsEnabled;
