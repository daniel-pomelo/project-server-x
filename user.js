const DEFAULT_USER_EXPERIENCE = {
  level_value: 1,
  xp_current: 0,
  xp_level: 0,
  xp_max: 240,
};

function addXPProps(experience = DEFAULT_USER_EXPERIENCE, user) {
  experience = experience || DEFAULT_USER_EXPERIENCE;
  return {
    ...user,
    xp_current: experience.xp_current,
    xp_max: experience.xp_max,
    xp_level: experience.xp_level,
    level_value: experience.level_value,
  };
}

async function findUserById(db, id) {
  const user = await db.findOne("Users", { id });
  if (!user) {
    return null;
  }
  const stats = await getUserStats(db, id);
  const experience = await db.findOne("UserExperience", { user_id: id });
  return addXPProps(experience, {
    ...user,
    health: user.stats.health,
    mana: user.stats.mana,
    stats,
  });
}
async function findAllUser(db) {
  const stats = await db.findAll("UsersProps");
  const experiences = await db.findAll("UserExperience");
  return db.findAll("Users").then((users) => {
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
  const stats = await db.find("UsersProps", { user_id: id });
  return reduce(stats);
}
function buildUserStats(stats, user) {
  return reduce(stats.filter((stat) => stat.user_id === user.id));
}

function reduce(stats) {
  const props = {
    strength: 0,
    fortitude: 0,
    health: 0,
    intelligence: 0,
    will: 0,
    perception: 0,
    agility: 0,
    endurance: 0,
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

module.exports = {
  findUserById,
  findAllUser,
  getUserStats,
};
