const { findUserPointsByUserId } = require("../../../user");
const { UserPoints, UserStats, isInsufficient, getTotal } = require("./util");

const assignPointsToStats = (db, systemEvents) => async (req, res) => {
  const userId = req.params.id;
  const stats = req.body;
  const bridge = await db.findUserBridge(userId);
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
