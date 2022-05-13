function incrementBySkillLevel(propBaseValue, skillLevelValue, levelGap) {
  const percentageByGap = Math.floor((propBaseValue / 100) * (levelGap * 10));
  return propBaseValue + percentageByGap * (skillLevelValue - 1);
}

function scaleSkill(skill) {
  return {
    ...skill,
    ...scale(skill, "health_self"),
    ...scale(skill, "health_other"),
    ...scale(skill, "mana_self"),
    ...scale(skill, "mana_other"),
    ...scale(skill, "amount"),
  };
}

function scale(skill, propName) {
  return skill[propName]
    ? {
        [propName]: incrementBySkillLevel(
          skill[propName],
          skill.skill_level_value,
          skill.level_gap
        ),
      }
    : {};
}

module.exports = scaleSkill;
