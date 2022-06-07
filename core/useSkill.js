function useSkill(player, skill) {
  const totalPoints = Object.keys(player).reduce((acc, statName) => {
    return acc + (player[statName] - 10);
  }, 0);

  const intelligence = (player.intelligence - 10) / totalPoints;

  if (totalPoints === 0) {
    return skill;
  }

  return {
    ...skill,
    ...scale(skill, "amount", intelligence),
    ...scale(skill, "health_self", intelligence),
    ...scale(skill, "mana_other", intelligence),
  };
}

function scale(skill, propName, intelligence) {
  const factor = (intelligence / 2) * intelligence * skill[propName];
  return skill[propName]
    ? { [propName]: Math.ceil(skill[propName] + factor) }
    : {};
}

module.exports = {
  useSkill,
};
