const reserveConquestPoint = require("../../reserveConquestPoint");

//Request:
//<Body>
// - ttl: Unit in seconds expresed as integer number, default 3600 seconds

function createConquestPoint(db) {
  return async (req, res) => {
    const { ttl = 3600 } = req.body;
    await reserveConquestPoint(db, { ttl });
    res.send({});
  };
}

module.exports = createConquestPoint;
