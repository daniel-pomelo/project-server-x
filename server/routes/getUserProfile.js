const { findUserById } = require("../../user");

const getUserProfile = (db) => async (req, res) => {
  const id = req.params.id;
  const user = await findUserById(db, id);
  console.log(user);
  const { stats } = user;
  console.log(user.xp_max - user.xp_level);
  console.log(user.xp_level / user.xp_max);
  const utils = {
    xp_level_percentage: new Number(
      (user.xp_level / user.xp_max) * 100
    ).toFixed(2),
  };
  res.render("profile", {
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
      ...utils,
    },
  });
};

module.exports = getUserProfile;
