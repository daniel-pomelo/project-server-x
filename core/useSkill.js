function useSkill(stats, skill, totalPoints) {
  if (totalPoints === 0) {
    return skill;
  }
  return {
    ...skill,
    ...scale(skill, "amount", stats.intelligence),
    ...scale(skill, "health_self", stats.intelligence),
    ...scale(skill, "mana_other", stats.intelligence),
  };
}

function scale(skill, propName, intelligence) {
  const factor = intelligence / 2;
  return skill[propName]
    ? { [propName]: getTotal(skill[propName], factor) }
    : {};
}

function getTotal(value, factor) {
  const total = value < 0 ? value - factor : value + factor;
  return Math.ceil(total);
}

module.exports = {
  useSkill,
};
