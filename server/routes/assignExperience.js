const { findBridgeById } = require("../../bridge");
const { timestamp } = require("../../time");

const firstLevelMaxXP = 240;

function calculateNextLevelXP(level) {
  let nextLevelXP = firstLevelMaxXP;
  for (i = 1; i < level; i++) {
    nextLevelXP += firstLevelMaxXP * 0.2;
  }
  return Math.round(nextLevelXP);
}

const INITIAL_USER_EXPERIENCE = {
  xp_level: 0,
  xp_current: 0,
  level_value: 1,
};

const assignExperience = (db, systemEvents) => async (req, res) => {
  const experienceToAssign = [...req.body];

  const userIds = experienceToAssign.map(({ user_id }) => user_id);
  const userExperiences = await db.groupByUserId("UserExperience", userIds);

  const operations = experienceToAssign.reduce(
    (acc, { user_id: userId, xp }) => {
      const currentUserExperience = userExperiences[userId];
      const userExperience = currentUserExperience || INITIAL_USER_EXPERIENCE;
      const isFirstAssignment = !currentUserExperience;
      const newUserExperience = reCalculate(userExperience, userId, xp);
      return [
        ...acc,
        {
          userId,
          newUserExperience,
          userExperience,
          isFirstAssignment,
        },
      ];
    },
    []
  );

  await db.saveUserExperience("UserExperience", operations);

  res.send();

  await db.registerAssignExperience(experienceToAssign, timestamp());

  const usersThatLevelUp = operations.filter((operation) => {
    const { userExperience, newUserExperience } = operation;
    return newUserExperience.level_value > userExperience.level_value;
  });

  const userPoints = usersThatLevelUp.map((operation) => {
    const { userExperience, newUserExperience, userId } = operation;
    const currentLevel = newUserExperience.level_value;
    const prevLevel = userExperience.level_value;
    const points = (currentLevel - prevLevel) * 10;
    return {
      user_id: userId,
      level_value: {
        previous: prevLevel,
        current: currentLevel,
      },
      points,
      type: "USER_LEVEL_UP_REWARD",
      timestamp: timestamp(),
    };
  });

  if (userPoints.length > 0) {
    await db.saveUserPoints(userPoints);
  }

  usersThatLevelUp.forEach(async (operation) => {
    const { userExperience, newUserExperience } = operation;
    systemEvents.notify("USER_LEVEL_UP", {
      currentLevel: newUserExperience.level_value,
      prevLevel: userExperience.level_value,
      userId: newUserExperience.user_id,
    });
  });
};

function reCalculate(userExperience, userId, xp) {
  const xpLevelTotal = userExperience.xp_level + xp;
  const xpCurrentTotal = userExperience.xp_current + xp;

  let level = userExperience.level_value;
  let xpByLevel = calculateNextLevelXP(level);
  let xpTotal = xpLevelTotal;

  while (xpTotal >= xpByLevel) {
    xpByLevel = calculateNextLevelXP(level);
    if (xpTotal - xpByLevel >= 0) {
      xpTotal -= xpByLevel;
      level += 1;
    } else {
      xpTotal = xpByLevel - (xpByLevel - xpTotal);
    }
  }
  return {
    user_id: userId,
    xp_current: xpCurrentTotal,
    xp_level: xpTotal,
    level_value: level,
    xp_max: calculateNextLevelXP(level),
  };
}

module.exports = assignExperience;
