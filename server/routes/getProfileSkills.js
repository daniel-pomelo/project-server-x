const BASE_URL = process.env.BACKEND_URL;

const getProfileSkills = (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 2 } = req.query;
  const next =
    BASE_URL + `/api/skills/${id}?page=${parseInt(page) + 1}&limit=${limit}`;
  res.send({
    skills: [],
    next,
  });
};

module.exports = getProfileSkills;
