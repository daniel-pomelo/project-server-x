const { timestamp } = require("../../time");

const getInviteUrl = (tokens, UI_URL, db) => async (req, res) => {
  try {
    const invitation = await createInvitation(db, req);
    const hashCode = tokens.getTokenForProfile(invitation);

    const url = UI_URL + "/register/" + hashCode;

    res.send({
      url,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

async function createInvitation(db, req) {
  const invitador = req.headers["invite-id"];
  const invitado = req.headers["user-id"];

  const [invitation, userToInviteIsStored] = await Promise.all([
    db.findOne("Invitations", {
      invitador,
      invitado,
    }),
    findUserToInvite(db, invitado),
  ]);

  if (userToInviteIsStored) {
    throw new Error("Invited user is already registered.");
  }
  if (!invitation) {
    const invitationToSave = {
      invitador,
      invitado,
      timestamp: timestamp(),
    };
    await db.save("Invitations", invitationToSave);
  }
  return {
    invitador,
    invitado,
  };
}

function findUserToInvite(db, invitado) {
  return db.findOne("Users", { id: invitado });
}

module.exports = getInviteUrl;
