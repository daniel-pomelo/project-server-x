const { getSkills, findUserById } = require("../../user");

const BASE_URL = process.env.BACKEND_URL;

const getProfileSkills = (db) => async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;

  const user = await findUserById(db, id);

  const { skills } = await getSkills(db, user, user.stats, user.level_value);

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
