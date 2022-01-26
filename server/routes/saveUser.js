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

const responses = {
  USER_ALREADY_EXISTS: {
    status: 400,
    message: "User already exists",
  },
  BRIDGE_NOT_FOUND: {
    status: 400,
    message: "Bridge not found",
  },
  ATTEMPT_NOT_FOUND: {
    status: 400,
    message: "Attempt not found",
  },
};

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

module.exports = (db, sorombombom) => async (req, res) => {
  try {
    const userId = req.params.id;

    await verifyUserAlreadyExists(db, userId);

    const bridge = await getBridgeFromRegisterAttempt(db, userId);

    const { name, breed, type, level_name } = req.body;
    const user = User.from(userId, name, breed, type, level_name);
    await db.save("Users", user);

    const asd = await findUserById(db, userId);

    sorombombom.notify(asd, bridge);

    res.status(201).send();
  } catch (error) {
    const custom = responses[error.message];
    return res
      .status((custom && custom.status) || 500)
      .send({ message: (custom && custom.message) || error.message });
  }
};
