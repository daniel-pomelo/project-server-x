function useSkill(player, skill) {
  const intelligence = player.intelligence / 10;
  return {
    ...skill,
    ...scale(skill, "amount", intelligence),
    ...scale(skill, "health_self", intelligence),
    ...scale(skill, "mana_other", intelligence),
  };
}

function scale(skill, propName, factor) {
  return skill[propName]
    ? { [propName]: Math.ceil(skill[propName] * factor) }
    : {};
}

module.exports = {
  useSkill,
};
