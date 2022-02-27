const DEFAULT_USER_EXPERIENCE = {
  level_value: 1,
  xp_current: 0,
  xp_level: 0,
  xp_max: 240,
};

function addXPProps(experience, user) {
  return {
    ...user,
    xp_current: experience.xp_current,
    xp_max: experience.xp_max,
    xp_level: experience.xp_level,
    level_value: experience.level_value,
  };
}

function calcHealth(fortitude, level_value) {
  return Math.round((fortitude / 1.8) * (level_value / 1.2) + 100);
}
function calcMana(endurance, level_value) {
  return Math.round((endurance / 1.8) * (level_value / 1.2) + 100);
}

async function findUserById(db, id) {
  const user = await db.findOne("Users", { id });
  if (!user) {
    return null;
  }
  const stats = await getUserStats(db, id);
  const experience =
    (await db.findOne("UserExperience", { user_id: id })) ||
    DEFAULT_USER_EXPERIENCE;
  const userPoints = await findUserPointsByUserId(db, id);
  return addXPProps(experience, {
    ...user,
    points: userPoints.balance,
    health: calcHealth(stats.fortitude, experience.level_value),
    mana: calcMana(stats.endurance, experience.level_value),
    stats,
  });
}
async function findAllUser(db, userIds = []) {
  const stats = await db.findAll("UserStats");
  const experiences = await db.findAll("UserExperience");
  const criteria =
    userIds.length > 0
      ? {
          id: { $in: userIds },
        }
      : null;
  return db.find("Users", criteria).then((users) => {
    return users.map((user) => {
      return addXPProps(
        experiences.find((experience) => experience.user_id === user.id),
        {
          ...user,
          health: user.stats.health,
          mana: user.stats.mana,
          stats: buildUserStats(stats, user),
        }
      );
    });
  });
}
async function getUserStats(db, id) {
  const stats = await db.find("UserStats", { user_id: id });
  return reduce(stats);
}
function buildUserStats(stats, user) {
  return reduce(stats.filter((stat) => stat.user_id === user.id));
}

function reduce(stats) {
  const props = {
    strength: 10,
    fortitude: 10,
    intelligence: 10,
    will: 10,
    perception: 10,
    agility: 10,
    endurance: 10,
    hit_damage: 10,
    hit_absorption: 5,
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
  getUserStats,
  findUserPointsByUserId,
};
