const { default: axios } = require("axios");

async function forceMeterUpdate(userId, db, context) {
  const bridge = await db.findOne("Bridges");
  try {
    console.log(
      `Send {user-id: ${userId}} to ${bridge.id} with URL ${bridge.url}.`
    );
    const result = await axios.post(bridge.url, {
      command: "CHARACTER_UPDATED",
      data: {
        "user-id": userId,
      },
    });
    await db.save("SentCommands", {
      context,
      result,
      bridge,
      user_id: userId,
    });
  } catch (error) {
    await db.save("SentCommands", {
      context,
      error: {
        message: error.message,
        stack: error.stack,
      },
      bridge,
      user_id: userId,
    });
  }
}

module.exports = {
  forceMeterUpdate,
};
