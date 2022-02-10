const { findBridgeById } = require("../../bridge");
const { findUserById } = require("../../user");

class User {
  static from(id, name, breed, type, level_name) {
    return {
      id,
      name,
      breed,
      type,
      level_name,
      level_value: 1,
      stats: {
        health: 100,
        mana: 100,
      },
    };
  }
}

async function verifyUserAlreadyExists(db, userId) {
  const user = await db.findOne("Users", { id: userId });
  if (user) {
    throw new Error("USER_ALREADY_EXISTS");
  }
}

async function getBridgeFromRegisterAttempt(db, userId) {
  const registerAttempt = await db.findOne("RegisterAttempts", { userId });
  if (!registerAttempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  const { bridgeId } = registerAttempt;
  const bridge = await findBridgeById(db, bridgeId);
  if (!bridge) {
    throw new Error("BRIDGE_NOT_FOUND");
  }
  return bridge;
}

module.exports = (db, systemEvents) => async (req, res) => {
  const userId = req.params.id;

  await verifyUserAlreadyExists(db, userId);

  const bridge = await getBridgeFromRegisterAttempt(db, userId);

  const { name, breed, type, level_name } = req.body;

  await db.save("Users", User.from(userId, name, breed, type, level_name));

  const user = await findUserById(db, userId);

  systemEvents.notify("SYNC_USER", { user, bridge });

  res.status(201).send();
};
