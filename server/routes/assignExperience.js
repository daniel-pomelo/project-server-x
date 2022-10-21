const { timestamp } = require("../../time");
const calculateNextLevelXPV2 = require("./calculateNextLevelXPV2");

const INITIAL_USER_EXPERIENCE = {
  xp_level: 0,
  xp_current: 0,
  level_value: 1,
};

async function getExperienceToAssign(db, body) {
  return Promise.all(
    body.map(async ({ user_id, xp }) => {
      const [userClan = [], userClanMembers = []] = await Promise.all([
        db
          .findOne("UserClans", {
            user_id,
            deleted_at: null,
          })
          .then((userClan) => {
            if (userClan) {
              return db
                .findOne("Clans", { _id: userClan.clan_id })
                .then((clan) => {
                  if (clan) {
                    return db.hasAConquerPoint(clan.name);
                  }
                });
            }
          }),
        db
          .findOne("UserClanMembers", {
            member_id: user_id,
            status: "joined",
          })
          .then((userClanMember) => {
            if (userClanMember) {
              return db
                .findOne("Clans", { _id: userClanMember.clan_id })
                .then((clan) => {
                  if (clan) {
                    return db.hasAConquerPoint(clan.name);
                  }
                });
            }
          }),
      ]);

      if (userClan.length > 0 || userClanMembers.length > 0) {
        return {
          user_id,
          original_xp: xp,
          xp: xp * 2,
        };
      }
      return {
        user_id,
        xp,
        original_xp: xp,
      };
    })
  );
}

const assignExperience = (db, systemEvents) => async (req, res) => {
  const bridgeId = req.headers["bridge-id"];
  const experienceToAssign = await getExperienceToAssign(db, req.body);

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

  res.send({});

  const record = { timestamp: timestamp() };
  const promisesOfUserExperienceRecords = experienceToAssign.map(
    ({ user_id, xp, original_xp }) => {
      return db.registerAssignExperience({
        bridge_id: bridgeId,
        ...record,
        user_id,
        xp,
        original_xp,
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
  let xpByLevel = calculateNextLevelXPV2(level);
  let xpTotal = xpLevelTotal;

  while (xpTotal >= xpByLevel) {
    xpByLevel = calculateNextLevelXPV2(level);
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
    xp_max: calculateNextLevelXPV2(level),
  };
}

module.exports = assignExperience;
