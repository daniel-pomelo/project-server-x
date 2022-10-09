const {
  HitDamage,
  HitAbsorption,
  HitSpeed,
  Health,
  Mana,
} = require("./user-stats");
const { getSkills } = require("./skills");

const DEFAULT_USER_EXPERIENCE = {
  level_value: 1,
  xp_current: 0,
  xp_level: 0,
  xp_max: 240,
};

function calcPointsBalance(records) {
  const balance = records.reduce((acc, record) => {
    if (record.type === "USER_POINTS_WITHDRAWAL") {
      return acc - record.points;
    } else if (record.type === "USER_LEVEL_UP_REWARD") {
      return acc + record.points;
    } else if (record.type === "USER_REGISTER_REWARD") {
      return acc + record.points;
    } else {
      return acc;
    }
  }, 0);
  return { balance };
}

async function findUserById(db, id) {
  const user = await db.findOne("Users", { id });
  if (!user) {
    return null;
  }
  const isDisabled = await db.findOne("DisabledUsers", { user_id: id });
  if (isDisabled !== null) {
    return { isDisabled: true };
  }
  const experience = await db
    .findOne("UserExperience", { user_id: id })
    .then((experience) => {
      return experience || DEFAULT_USER_EXPERIENCE;
    });
  const stats = await db
    .find("UserStats", { user_id: id })
    .then((stats) => reduce(stats, experience.level_value, db));
  const [userPoints, skillPoints, userSkills] = await Promise.all([
    db.find("UserPoints", { user_id: id }),
    db.find("UserSkillPoints", { user_id: id }),
    getSkills(db, user, stats, experience.level_value),
  ]).then(([userPoints, skillPoints, userSkills]) => {
    return [
      calcPointsBalance(userPoints),
      calcPointsBalance(skillPoints),
      userSkills.skills,
    ];
  });

  return {
    ...user,
    health: Health.calc(stats.fortitude, experience.level_value),
    mana: Mana.calc(stats.endurance, experience.level_value),
    xp_current: experience.xp_current,
    xp_max: experience.xp_max,
    xp_level: experience.xp_level,
    level_value: experience.level_value,
    points: userPoints.balance,
    skill_points: skillPoints.balance,
    stats,
    skills: userSkills,
  };
}
async function findAllUser(db, userIds = []) {
  const criteria =
    userIds.length > 0
      ? {
          id: { $in: userIds },
        }
      : null;
  return db.find("Users", criteria);
}

async function reduce(stats, level_value, db) {
  const defaultStats = await db.getDefaultStats();

  const userStats = stats.reduce((acc, stat) => {
    return Object.entries(stat).reduce((initial, [name, value]) => {
      if (initial[name] !== undefined && initial[name] !== null) {
        return {
          ...initial,
          [name]: initial[name] + value,
        };
      } else {
        return initial;
      }
    }, acc);
  }, defaultStats);
  return {
    ...userStats,
    _id: undefined,
    hit_damage: HitDamage.calc(userStats.strength, level_value),
    hit_absorption: HitAbsorption.calc(userStats.absorption, level_value),
    hit_speed: HitSpeed.calc(userStats),
  };
}

async function getUserStats(db, id) {
  const stats = await db.find("UserStats", { user_id: id });

  const props = {
    strength: 10,
    fortitude: 10,
    intelligence: 10,
    will: 10,
    perception: 10,
    agility: 10,
    endurance: 10,
    absorption: 10,
  };

  return stats.reduce((acc, stat) => {
    return Object.entries(stat).reduce((initial, [name, value]) => {
      if (initial[name] !== undefined && initial[name] !== null) {
        return {
          ...initial,
          [name]: initial[name] + value,
        };
      } else {
        return initial;
      }
    }, acc);
  }, props);
}

async function findUserPointsByUserId(db, id) {
  const records = await db.find("UserPoints", { user_id: id });
  const balance = records.reduce((acc, record) => {
    if (record.type === "USER_POINTS_WITHDRAWAL") {
      return acc - record.points;
    } else if (record.type === "USER_LEVEL_UP_REWARD") {
      return acc + record.points;
    } else {
      return acc;
    }
  }, 0);
  return { balance };
}

module.exports = {
  findUserById,
  findAllUser,
  findUserPointsByUserId,
  getUserStats,
};
