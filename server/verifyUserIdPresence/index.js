function verifyUserIdPresence(req, res, next) {
  const id = req.params.id;
  if (!id) {
    res.status(400).send();
  } else {
    next();
  }
}

module.exports = {
  verifyUserIdPresence,
};
