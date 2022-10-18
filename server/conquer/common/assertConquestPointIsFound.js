function assertConquestPointIsFound(conquestPoint, req, context) {
  if (!conquestPoint) {
    const e = new Error("BAD_REQUEST");
    e.context = context;
    e.reason = "Conquest point not found.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
}

module.exports = assertConquestPointIsFound;
