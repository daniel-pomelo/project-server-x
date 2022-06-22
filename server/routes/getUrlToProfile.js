const axios = require("axios").default;

const getUrlToProfile = async (req, res) => {
  const userId = req.params.id;
  const response = await axios.get("http://localhost:3006/api/auth/" + userId);
  res.send({
    url: response.data.url,
  });
};

module.exports = getUrlToProfile;
