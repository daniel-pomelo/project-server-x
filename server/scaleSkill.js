function incrementBySkillLevel(prop_base, skill_level_value) {
  return prop_base + (prop_base / 100) * 20 * (skill_level_value - 1);
}

function scaleSkill(skill) {
  const { skill_level_value = 1 } = skill;
  const health_self = skill.health_self
    ? {
        health_self: incrementBySkillLevel(
          skill.health_self,
          skill_level_value
        ),
      }
    : {};
  const mana_self = skill.mana_self
    ? { mana_self: incrementBySkillLevel(skill.mana_self, skill_level_value) }
    : {};
  return {
    ...skill,
    ...health_self,
    ...mana_self,
  };
}

module.exports = scaleSkill;
