const { findUserPointsByUserId, findUserById } = require("../../user");
const { timestamp } = require("../../time");

const statsNames = [
  "strength",
  "fortitude",
  "intelligence",
  "will",
  "perception",
  "agility",
  "endurance",
];

const assignPointsToStats = (db) => async (req, res, next) => {
  try {
    const userId = req.params.id;
    const points = await findUserPointsByUserId(db, userId);
    if (points.balance <= 0) {
      return res.status(400).send({ message: "Insufficient points" });
    }
    const stats = { user_id: userId, ...req.body, timestamp: timestamp() };
    await db.save("UserStats", stats);

    await db.saveUserPoints([
      {
        user_id: userId,
        points: points.balance,
        type: "USER_POINTS_WITHDRAWAL",
        timestamp: timestamp(),
      },
    ]);

    res.send();
  } catch (error) {
    next(error);
  }
};

module.exports = assignPointsToStats;
