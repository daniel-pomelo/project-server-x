const { timestamp } = require("../../../time");

const statsNames = [
  "strength",
  "fortitude",
  "intelligence",
  "will",
  "perception",
  "agility",
  "endurance",
];

function getTotal(stats) {
  return statsNames.reduce((acc, statName) => acc + (stats[statName] || 0), 0);
}

class UserStats {
  static from(userId, stats) {
    return {
      user_id: userId,
      ...stats,
      timestamp: timestamp(),
    };
  }
}
class UserPoints {
  static withdrawal(userId, points) {
    const type = "USER_POINTS_WITHDRAWAL";
    return {
      type,
      points,
      user_id: userId,
      timestamp: timestamp(),
    };
  }
}

function isInsufficient(balance, total) {
  return balance <= 0 || balance < total;
}

module.exports = {
  UserPoints,
  UserStats,
  isInsufficient,
  getTotal,
};
