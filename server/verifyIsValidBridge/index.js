function verifyIsValidBridge(req, res, next) {
  const bridge = req.headers["bridge-id"];
  if (!bridge) {
    res.status(403).send();
  } else {
    next();
  }
}

module.exports = {
  verifyIsValidBridge,
};
