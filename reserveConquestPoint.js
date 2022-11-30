const uuid = require("uuid");
const { timestamp } = require("./time");

const reserveConquestPoint = async (db, { ttl }) => {
  const data = {
    id: uuid.v4(),
    status: "inactive",
    ttl,
    timestamp: timestamp(),
  };
  await db.save("ConquestPoints", data);
  return data;
};

module.exports = reserveConquestPoint;
