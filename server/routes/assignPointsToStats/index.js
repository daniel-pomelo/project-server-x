const { findUserPointsByUserId } = require("../../../user");
const { UserPoints, UserStats, isInsufficient, getTotal } = require("./util");

const requestCameFromBridgeEnabled = async (req, db) => {
  const id = req.params.id;
  const { bridge_id } = await db.findOne("UserBridges", { user_id: id });
  const bridge = await db.findOne("Bridges", { id: bridge_id });
  if (!bridge || !bridge.enabled) {
    throw new Error("Bridge invalid");
  }
  return bridge;
};

const assignPointsToStats = (db, systemEvents) => async (req, res) => {
  const bridge = await requestCameFromBridgeEnabled(req, db);

  const userId = req.params.id;
  const stats = req.body;
  const { balance } = await findUserPointsByUserId(db, userId);
  const total = getTotal(stats);

  if (isInsufficient(balance, total)) {
    return res.status(400).send({ message: "Insufficient points" });
  }

  await db.save("UserStats", UserStats.from(userId, stats));

  await db.saveUserPoints([UserPoints.withdrawal(userId, balance)]);

  systemEvents.notifyThatUserHasTrained(userId, bridge);

  res.send({});
};

module.exports = assignPointsToStats;
