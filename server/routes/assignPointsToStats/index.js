const { findUserPointsByUserId } = require("../../../user");
const { UserPoints, UserStats, isInsufficient, getTotal } = require("./util");

const assignPointsToStats = (db) => async (req, res) => {
  const userId = req.params.id;
  const stats = req.body;
  const { balance } = await findUserPointsByUserId(db, userId);
  const total = getTotal(stats);

  if (isInsufficient(balance, total)) {
    return res.status(400).send({ message: "Insufficient points" });
  }

  await db.save("UserStats", UserStats.from(userId, stats));

  await db.saveUserPoints([UserPoints.withdrawal(userId, balance)]);

  res.send({});
};

module.exports = assignPointsToStats;
