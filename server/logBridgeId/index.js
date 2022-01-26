function logBridgeId(req, res, next) {
  if (process.env.ENV_NAME !== "dev") {
    const bridge = req.headers["bridge-id"];
    console.log("bridge: ", bridge);
  }
  next();
}

module.exports = {
  logBridgeId,
};
