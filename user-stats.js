class Health {
  static calc(fortitude, level_value) {
    return Math.round((fortitude / 1.8) * (level_value / 1.2) + 100);
  }
}
class Mana {
  static calc(endurance, level_value) {
    return Math.round((endurance / 1.8) * (level_value / 1.2) + 100);
  }
}
class HitDamage {
  static calc(strength, level_value) {
    if (level_value === 1) {
      return strength;
    }
    const percentageToTake = (Math.floor(level_value / 10) + 1) * 10;
    const calcPercentage = Math.ceil((strength / 100) * percentageToTake);
    return strength + calcPercentage;
  }
}
class HitAbsorption {
  static calc(absorption, level_value) {
    if (level_value === 1) {
      return absorption;
    }
    const percentageToTake = (Math.floor(level_value / 10) + 1) * 10;
    const calcPercentage = Math.ceil((absorption / 100) * percentageToTake);
    return absorption + calcPercentage;
  }
}
class HitSpeed {
  static calc(userStats) {
    const { strength, perception } = userStats;
    const divisor = perception + perception * 0.5;
    const speed = strength / divisor;
    if (speed <= 0.25) {
      return 0.25;
    }
    if (speed >= 1) {
      return 1;
    }
    return speed;
  }
}

module.exports = {
  Health,
  Mana,
  HitDamage,
  HitAbsorption,
  HitSpeed,
};
