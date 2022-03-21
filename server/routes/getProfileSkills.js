const BASE_URL = "http://localhost:3001";

const getProfileSkills = (db) => async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  const skillsCatalog = await db.find("Skills");
  const userSkills = await db.find("UserSkills", { user_id: id });

  const skills = (userSkills[0] ? userSkills[0].skills : []).map((skill) => {
    return {
      ...skillsCatalog.find(
        (skillFromCatalog) => skillFromCatalog.id === skill.id
      ),
    };
  });
  const hasMore = skills.length > (page - 1) * 2 + 2;

  res.send({
    ...(hasMore
      ? { next: `${BASE_URL}/api/skills/${id}?page=${parseInt(page) + 1}` }
      : {}),
    skills: skills.slice((page - 1) * 2, (page - 1) * 2 + 2),
  });
};

module.exports = getProfileSkills;
