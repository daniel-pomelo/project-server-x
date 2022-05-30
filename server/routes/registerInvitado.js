const { timestamp } = require("../../time");

module.exports = (db, tokens, UI_URL) => async (req, res) => {
  const invitation = tokens.getUserIdFromToken(req.params.id);

  const id = invitation.invitado;

  await verifyUserIsNotRegistered(db, id);

  await db.save("Users", User.from(id, req.body));

  tokens.removeFromId(req.params.id);

  await db.updateOne(
    "Invitations",
    {
      invitador: invitation.invitador,
      invitado: invitation.invitado,
    },
    { invitado_at: timestamp() }
  );

  const url = returnUrlToProfile(tokens, id, UI_URL);

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

function returnUrlToProfile(tokens, id, UI_URL) {
  const token = tokens.getTokenForProfile(id);
  return UI_URL + "/auth/" + token;
}
