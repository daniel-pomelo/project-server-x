const BASE_URL = process.env.BACKEND_URL;

const getProfileSkills = (db) => async (req, res) => {
  const { id } = req.params;
  const skillsCatalog = await db.find("Skills");
  const skills = await db.find("UserSkills", { user_id: id });
  res.send({
    skills: (skills[0] ? skills[0].skills : []).map((skill) => {
      return {
        ...skillsCatalog.find(
          (skillFromCatalog) => skillFromCatalog.id === skill.id
        ),
      };
    }),
  });
};

module.exports = getProfileSkills;
