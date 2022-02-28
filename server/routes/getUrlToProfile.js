const getUrlToProfile = (tokens, UI_URL) => (req, res) => {
  const userId = req.params.id;
  const token = tokens.getTokenForProfile(userId);
  const url = UI_URL + "/auth/" + token;
  res.send({
    url,
  });
};

module.exports = getUrlToProfile;
