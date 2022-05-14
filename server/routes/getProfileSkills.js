const { romanize } = require("romans");
const scaleSkill = require("../scaleSkill");

const BASE_URL = process.env.BACKEND_URL;

const getProfileSkills = (db) => async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  const skillsCatalog = await db.find("Skills");
  const userSkills = await db.find("UserSkills", { user_id: id });

  const skills = (userSkills[0] ? userSkills[0].skills : []).map((skill) => {
    const skillFromCatalog = skillsCatalog.find(
      (skillFromCatalog) => skillFromCatalog.id === skill.id
    );
    const asd = scaleSkill({
      ...skillFromCatalog,
      skill_level_value: skill.skill_level_value,
    });

    return {
      reach: asd.reach,
      name: `${asd.name}-${romanize(skill.skill_level_value || 1)}`,
      icon: asd.icon,
      mana_self: asd.mana_self,
      mana_other: asd.mana_other,
      health_self: asd.health_self,
      health_other: asd.health_other,
      effect: asd.effect,
      amount: asd.amount,
      duration: asd.duration,
      cooldown: asd.cooldown,
      target: asd.target,
    };
  });
  const hasMore = skills.length > (page - 1) * 2 + 2;

  res.send({
    ...(hasMore
      ? { next: `${BASE_URL}/api/skills/${id}?page=${parseInt(page) + 1}` }
      : {}),
    skills: skills.slice((page - 1) * 2, (page - 1) * 2 + 2),
    user_id: id,
  });
};

module.exports = getProfileSkills;
