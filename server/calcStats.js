const { skillMapper } = require("../skills");
const { HitDamage, HitAbsorption, HitSpeed } = require("../user-stats");

const calcStats = (db) => async (req, res) => {
  const skills = req.body.skills;
  const stats = req.body.stats;
  const level_value = req.body.level_value;
  const totalPoints = (level_value - 1) * 10;
  const skillsCatalog = await db.find("Skills").then(SkillsCatalog.render);
  const output = {
    hit_damage: HitDamage.calc(stats.strength, level_value),
    hit_absorption: HitAbsorption.calc(stats.absorption, level_value),
    hit_speed: HitSpeed.calc(stats),
    skills: skills.map((skill) =>
      skillMapper(skill, skillsCatalog, totalPoints, stats)
    ),
  };
  res.send(output);
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

module.exports = calcStats;
