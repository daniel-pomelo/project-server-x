const { getPlayerToken } = require("../../auth");

const getUrlToProfile = async (req, res) => {
  const userId = req.params.id;
  const url = await getPlayerToken(userId);
  res.send({
    url,
  });
};

module.exports = getUrlToProfile;
