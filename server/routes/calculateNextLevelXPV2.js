const calculateNextLevelXP = require("./calculateNextLevelXP");

const XP_PER_DAY = (32 / 5) * 60 * 24;

function calculateNextLevelXPV2(level) {
  if (level < 50) {
    return calculateNextLevelXP(level);
  }
  const c = Math.round(level / 10);
  return calculateNextLevelXP(level) * c;
}

module.exports = calculateNextLevelXPV2;
