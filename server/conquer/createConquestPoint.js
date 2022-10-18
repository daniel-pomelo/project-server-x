const uuid = require("uuid");
const { timestamp } = require("../../time");

//Request:
//<Body>
// - ttl: Unit in seconds expresed as integer number, default 3600 seconds

function createConquestPoint(db) {
  return async (req, res) => {
    const { ttl = 3600 } = req.body;
    const data = {
      id: uuid.v4(),
      status: "inactive",
      ttl,
      timestamp: timestamp(),
    };
    await db.save("ConquestPoints", data);
    res.send({});
  };
}

module.exports = createConquestPoint;
