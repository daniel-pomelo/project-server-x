const { default: axios } = require("axios");
const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");

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

module.exports = (db) => async (req, res) => {
  const invitationKey = req.params.id;
  const invitation = await db.findOne("Invitations", { key: invitationKey });

  const id = invitation.invitado;

  await verifyUserIsNotRegistered(db, id);

  await db.save("Users", User.from(id, req.body));

  await db.updateInvitationTimestamp(invitation, timestamp());

  const url = await getProfileUrl(id);

  res.status(201).send({ url });

  await forceMeterUpdate(id, db);
};

class User {
  static from(id, { name, breed, type, level_name }) {
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

async function verifyUserIsNotRegistered(db, id) {
  const user = await db.findOne("Users", { id });
  if (user) {
    throw new Error("USER_ALREADY_EXISTS");
  }
}
