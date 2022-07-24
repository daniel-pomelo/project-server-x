const { getPlayerToken } = require("../../auth");
const { timestamp } = require("../../time");

module.exports = (db, tokens) => async (req, res) => {
  const invitation = tokens.getUserIdFromToken(req.params.id);
  const id = invitation.invitado;

  await verifyUserIsNotRegistered(db, id);

  await db.save("Users", User.from(id, req.body));

  tokens.removeFromId(req.params.id);

  await db.updateInvitationTimestamp(invitation, timestamp());

  const url = await getPlayerToken(id);

  await db.registerUserMeterAsPending(id);

  res.status(201).send({ url });
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
