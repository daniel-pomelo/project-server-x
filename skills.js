const { romanize } = require("romans");
const getSkillLabel = (skill) =>
  `${skill.name}-${romanize(skill.skill_level_value)}`;

const skillMapper = (userSkill, skillsCatalog, totalPoints, stats) => {
  const skill = skillsCatalog.getSkill(userSkill);
  const name = getSkillLabel(skill);
  skill.name = name;
  const scaledSkill = {
    ...skill,
    ...scale(skill, "health_self"),
    ...scale(skill, "health_other"),
    ...scale(skill, "mana_self"),
    ...scale(skill, "mana_other"),
    ...scale(skill, "amount"),
  };

  const userSkill2 = {
    id: scaledSkill.id,
    reach: scaledSkill.reach,
    name,
    icon: scaledSkill.icon,
    mana_self: scaledSkill.mana_self,
    mana_other: scaledSkill.mana_other,
    health_self: scaledSkill.health_self,
    health_other: scaledSkill.health_other,
    effect: scaledSkill.effect,
    amount: scaledSkill.amount,
    duration: scaledSkill.duration,
    cooldown: scaledSkill.cooldown,
    target: scaledSkill.target,
    user_level_value: userSkill.user_level_value,
    skill_level_value: scaledSkill.skill_level_value,
  };

  if (totalPoints === 0) {
    return userSkill2;
  }
  return {
    ...userSkill2,
    ...scaleByIntelligence(userSkill2, "amount", stats.intelligence),
    ...scaleByIntelligence(userSkill2, "health_self", stats.intelligence),
    ...scaleByIntelligence(userSkill2, "health_other", stats.intelligence),
    ...scaleByIntelligence(userSkill2, "mana_self", stats.intelligence),
    ...scaleByIntelligence(userSkill2, "mana_other", stats.intelligence),
  };
};

class SkillsCatalog {
  static render(skillsCatalogData) {
    return {
      getSkill(skill) {
        const skillFromCatalog = skillsCatalogData.find(
          (skillFromCatalog) => skillFromCatalog.id === skill.id
        );
        const skill_level_value = skill.skill_level_value || 1;
        return {
          ...skillFromCatalog,
          skill_level_value,
        };
      },
    };
  }
}

async function getSkills(db, user, stats, level_value) {
  const skillsCatalogData = await db.find("Skills").then(SkillsCatalog.render);
  const userSkills = await db.find("UserSkills", {
    user_id: user.id,
    status: { $ne: "invalidated_by_respec" },
  });
  const totalPoints = (level_value - 1) * 10;

  const skillsCatalog = skillsCatalogData;

  const skills = (userSkills[0] ? userSkills[0].skills : []).map((skill) => {
    return skillMapper(skill, skillsCatalog, totalPoints, stats);
  });
  return { skills, stats };
}

function incrementBySkillLevel(propBaseValue, skillLevelValue) {
  return propBaseValue + propBaseValue * (skillLevelValue - 1);
}

function scale(skill, propName) {
  return skill[propName]
    ? {
        [propName]: incrementBySkillLevel(
          skill[propName],
          skill.skill_level_value
        ),
      }
    : {};
}

const skillFactor = 20;
const intelligenceFactor = 20;

function scaleByIntelligence(skill, propName, intelligence) {
  const baseSkillValuePercentage = (skill[propName] / 100) * skillFactor;
  const baseSkillValue = skill[propName];
  const total =
    baseSkillValue +
    (intelligence / intelligenceFactor) * baseSkillValuePercentage;
  return skill[propName] ? { [propName]: Math.ceil(total) } : {};
}

module.exports = {
  getSkills,
  skillMapper,
};
