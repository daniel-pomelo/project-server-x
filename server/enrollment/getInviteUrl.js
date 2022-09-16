const { timestamp } = require("../../time");

const getInviteUrl = (tokens, UI_URL, db) => async (req, res) => {
  const invitation = await createInvitation(db, req);
  const hashCode = tokens.getTokenForProfile(invitation);

  const url = UI_URL + "/register/" + hashCode;

  res.send({
    url,
  });
};

async function createInvitation(db, req) {
  const invitador = req.headers["invite-id"];
  const invitado = req.headers["user-id"];

  if (!invitado || !invitador) {
    const e = new Error("Invitado and Invitador are required");
    e.kind = "INVITE_BAD_REQUEST";
    e.payload = req.headers;
    throw e;
  }

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
