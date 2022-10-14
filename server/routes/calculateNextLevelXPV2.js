const calculateNextLevelXP = require("./calculateNextLevelXP");

const XP_PER_DAY = (32 / 5) * 60 * 24;
const MAX_DAYS_TO_COMPLETE_LEVEL = 7;

function calculateNextLevelXPV2(level) {
  if (level < 50) {
    return calculateNextLevelXP(level);
  }
  const daysNeededToCompleteLevel = Math.round(level / 10);
  const c =
    daysNeededToCompleteLevel > MAX_DAYS_TO_COMPLETE_LEVEL
      ? MAX_DAYS_TO_COMPLETE_LEVEL
      : daysNeededToCompleteLevel;
  return (c - 1) * XP_PER_DAY;
}

module.exports = calculateNextLevelXPV2;
