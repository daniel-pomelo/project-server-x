const { findBridgeById } = require("../../bridge");
const { findAllUser } = require("../../user");

const firstLevelMaxXP = 240;

function calculateNextLevelXP(level) {
  let nextLevelXP = firstLevelMaxXP;
  for (i = 1; i < level; i++) {
    nextLevelXP += firstLevelMaxXP * 0.2;
  }
  return Math.round(nextLevelXP);
}

const timestamp = () => new Date().toISOString();

const INITIAL_USER_EXPERIENCE = {
  xp_level: 0,
  xp_current: 0,
  level_value: 1,
};

const assignExperience = (db, systemEvents) => async (req, res) => {
  const bridgeId = req.headers["bridge-id"];
  const bridge = await findBridgeById(db, bridgeId);

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
          newUserExperience,
          userExperience,
          isFirstAssignment,
        },
      ];
    },
    []
  );

  await db.bulkWrite("UserExperience", operations);

  const usersToSync = await findAllUser(db, userIds);

  usersToSync.forEach((user) => {
    systemEvents.notify(user, bridge);
  });

  res.send();

  await db.registerAssignExperience(experienceToAssign, timestamp());
};

function reCalculate(userExperience, userId, xp) {
  const xpLevelTotal = ((userExperience && userExperience.xp_level) || 0) + xp;
  const xpCurrentTotal =
    ((userExperience && userExperience.xp_current) || 0) + xp;

  let level = (userExperience && userExperience.level_value) || 1;

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
