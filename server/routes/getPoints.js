const getPoints = (db) => async (req, res) => {
  const { id } = req.params;
  const [points, skillPoints] = await Promise.all([
    db.find("UserPoints", { user_id: id }, { sorting: "desc" }),
    db.find("UserSkillPoints", { user_id: id }, { sorting: "desc" }),
  ]);

  res.send({
    points,
    skill_points: skillPoints,
  });
};

module.exports = getPoints;
