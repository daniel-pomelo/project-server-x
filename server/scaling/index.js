const { timestamp } = require("../../time");
const asyncHandler = require("../routes/asyncHandler");

const URL_UPDATE_GROWING_FACTORS = "/api/growing-factors";

module.exports = {
  getCharacterGrowingFactor: async (db) => {
    const characterGrowingFactor = await db.getCharacterGrowingFactor();
    return characterGrowingFactor.value;
  },
  getSkillGrowingFactor: async (db) => {
    const characterGrowingFactor = await db.getSkillGrowingFactor();
    return characterGrowingFactor.value;
  },
  updateGrowingFactors: (app, db) => {
    app.post(
      URL_UPDATE_GROWING_FACTORS,
      asyncHandler(async (req, res) => {
        const characterGrowingFactor = {
          type: "character_growing_factor",
          value: req.body.character_growing_factor,
          timestamp: timestamp(),
        };
        const skillGrowingFactor = {
          type: "skill_growing_factor",
          value: req.body.skill_growing_factor,
          timestamp: timestamp(),
        };
        await db.saveGrowingFactors(characterGrowingFactor);
        await db.saveGrowingFactors(skillGrowingFactor);
        res.send({});
      })
    );
  },
};
