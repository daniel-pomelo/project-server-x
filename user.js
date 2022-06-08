const { romanize } = require("romans");
const scaleSkill = require("./server/scaleSkill");
const { useSkill } = require("./core/useSkill");

const {
  HitDamage,
  HitAbsorption,
  HitSpeed,
  Health,
  Mana,
} = require("@origin-la/user-stats");

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
  const [experience, userPoints, stats, skillPoints, userSkills] =
    await Promise.all([
      db.findOne("UserExperience", { user_id: id }),
      db.find("UserPoints", { user_id: id }),
      db.find("UserStats", { user_id: id }),
      db.find("UserSkillPoints", { user_id: id }),
      db.find("UserSkills", { user_id: id }),
    ]).then(([experience, userPoints, stats, skillPoints, userSkills]) => {
      const userExperience = experience || DEFAULT_USER_EXPERIENCE;
      return [
        userExperience,
        calcPointsBalance(userPoints),
        reduce(stats, userExperience.level_value),
        calcPointsBalance(skillPoints),
        (userSkills[0] && userSkills[0].skills) || [],
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

function reduce(stats, level_value) {
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
  }, props);

  return {
    ...userStats,
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

const getSkills = async (db, user) => {
  const skillsCatalog = await db.find("Skills");
  const userSkills = await db.find("UserSkills", { user_id: user.id });

  const level_value = (user && user.level_value) || 1;
  const stats = (user && user.stats) || {};

  const totalPoints = (level_value - 1) * 10;

  const skills = (userSkills[0] ? userSkills[0].skills : []).map((skill) => {
    const skillFromCatalog = skillsCatalog.find(
      (skillFromCatalog) => skillFromCatalog.id === skill.id
    );
    const asd = scaleSkill({
      ...skillFromCatalog,
      skill_level_value: skill.skill_level_value || 1,
    });

    const userSkill = {
      reach: asd.reach,
      name: `${asd.name}-${romanize(skill.skill_level_value || 1)}`,
      icon: asd.icon,
      mana_self: asd.mana_self,
      mana_other: asd.mana_other,
      health_self: asd.health_self,
      health_other: asd.health_other,
      effect: asd.effect,
      amount: asd.amount,
      duration: asd.duration,
      cooldown: asd.cooldown,
      target: asd.target,
    };

    return useSkill(stats, userSkill, totalPoints);
  });
  return { skills, stats };
};

module.exports = {
  findUserById,
  findAllUser,
  findUserPointsByUserId,
  getUserStats,
  getSkills,
};
