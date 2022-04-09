const getPoints = (db) => async (req, res) => {
  const { id } = req.params;
  const [points, skillPoints] = await Promise.all([
    db.find("UserPoints", { user_id: id }),
    db.find("UserSkillPoints", { user_id: id }),
  ]);

  res.send({
    points,
    skill_points: skillPoints,
  });
};

module.exports = getPoints;
