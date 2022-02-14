const { findUserById, findUserPointsByUserId } = require("../../user");

const cache = new Map();

const getUserProfile = (db) => async (req, res) => {
  const id = req.params.id;
  if (cache.get(id)) {
    return res.render("profile", cache.get(id));
  }
  const user = await findUserById(db, id);
  if (!user) {
    return res.render("not_found");
  }
  const userPoints = await findUserPointsByUserId(db, id);

  const { stats } = user;

  const utils = {
    xp_level_percentage: new Number(
      (user.xp_level / user.xp_max) * 100
    ).toFixed(2),
  };

  const points = userPoints.balance;

  const response = {
    user: {
      name: user.name,
      health: user.health,
      mana: user.mana,
      strength: stats.strength,
      fortitude: stats.fortitude,
      intelligence: stats.intelligence,
      will: stats.will,
      perception: stats.perception,
      agility: stats.agility,
      endurance: stats.endurance,
      level_value: user.level_value,
      level_name: user.level_name,
      xp_current: user.xp_current,
      xp_max: user.xp_max,
      xp_level: user.xp_level,
      has_points: points !== null && points !== undefined && points > 0,
      points: points,
      ...utils,
    },
  };

  cache.set(id, response);

  res.render("profile", response);
};

module.exports = getUserProfile;
