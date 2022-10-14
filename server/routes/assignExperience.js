const { timestamp } = require("../../time");
const calculateNextLevelXP = require("./calculateNextLevelXP");

const CONQUER_ID = "conquer";

const INITIAL_USER_EXPERIENCE = {
  xp_level: 0,
  xp_current: 0,
  level_value: 1,
};

const assignExperience = (db, systemEvents) => async (req, res) => {
  const bridgeId = req.headers["bridge-id"];
  const experienceToAssign = [...req.body];

  const userIds = experienceToAssign.map(({ user_id }) => user_id);
  const userExperiences = await db.groupByUserId("UserExperience", userIds);

  const operations = experienceToAssign.reduce(
    (acc, { user_id: userId, xp }) => {
      const currentUserExperience = userExperiences[userId];
      const userExperience = currentUserExperience || INITIAL_USER_EXPERIENCE;
      const isFirstAssignment = !currentUserExperience;
      const newUserExperience = reCalculate(
        userExperience,
        userId,
        getXP(req, userExperience.level_value, xp)
      );
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

  res.send({});

  const record = { timestamp: timestamp() };
  const promisesOfUserExperienceRecords = experienceToAssign.map(
    ({ user_id, xp }) => {
      const currentUserExperience = userExperiences[user_id];
      const userExperience = currentUserExperience || INITIAL_USER_EXPERIENCE;
      return db.registerAssignExperience({
        bridge_id: bridgeId,
        ...record,
        user_id,
        original_xp: xp,
        xp: getXP(req, userExperience.level_value, xp),
        use_case: isConquerUseCase(req) ? CONQUER_ID : undefined,
      });
    }
  );

  await Promise.all(promisesOfUserExperienceRecords);

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

  const userSkillPoints = usersThatLevelUp.map((operation) => {
    const { userExperience, newUserExperience, userId } = operation;
    const currentLevel = newUserExperience.level_value;
    const prevLevel = userExperience.level_value;
    const points = currentLevel - prevLevel;
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

  if (userSkillPoints.length > 0) {
    await db.saveUserSkillPoints(userSkillPoints);
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

function getXpByUserLevel(levelValue, xp) {
  if (levelValue >= 50) {
    return xp / 10;
  }
  return xp;
}
const isConquerUseCase = (req) => {
  return req.headers["use-case"] === CONQUER_ID;
};
function getXP(req, levelValue, xp) {
  if (isConquerUseCase(req)) {
    return xp;
  }
  return getXpByUserLevel(levelValue, xp);
}

module.exports = assignExperience;
