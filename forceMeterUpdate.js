const { default: axios } = require("axios");

async function forceMeterUpdate(userId, db) {
  const bridge = await db.findOne("Bridges");
  console.log(
    `Send {user-id: ${userId}} to ${bridge.id} with URL ${bridge.url}.`
  );
  await axios.post(bridge.url, {
    command: "CHARACTER_UPDATED",
    data: {
      "user-id": userId,
    },
  });
}

module.exports = {
  forceMeterUpdate,
};
