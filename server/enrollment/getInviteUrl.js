const { timestamp } = require("../../time");
const { v4: uuidv4 } = require("uuid");

const getInviteUrl = (UI_URL, db) => async (req, res) => {
  const hashCode = uuidv4();

  await createInvitation(db, req, hashCode);

  const url = UI_URL + "/register/" + hashCode;

  res.send({
    url,
  });
};

function assertArguments(req) {
  const invitador = req.headers["invite-id"];
  const invitado = req.headers["user-id"];
  if (!invitado || !invitador) {
    const e = new Error("BAD_REQUEST");
    e.context = "CREATING_INVITATION";
    e.reason = "MISSING_ARGUMENTS";
    e.payload = {
      headers: req.headers,
    };
    throw e;
  }
}

function getData(db, req) {
  const invitador = req.headers["invite-id"];
  const invitado = req.headers["user-id"];
  return Promise.all([
    db.findOne("Invitations", {
      invitador,
      invitado,
    }),
    findUserToInvite(db, invitado),
    findUserToInvite(db, invitador),
  ]);
}

function assertIsUserRegistered(userToInviteIsStored, req) {
  if (userToInviteIsStored) {
    const e = new Error("BAD_REQUEST");
    e.context = "CREATING_INVITATION";
    e.reason = "USER_ALREADY_REGISTERED";
    e.payload = {
      headers: req.headers,
    };
    throw e;
  }
}
function assertInvitadorExists(invitadorExists, req) {
  if (!invitadorExists) {
    const e = new Error("BAD_REQUEST");
    e.context = "CREATING_INVITATION";
    e.reason = "INVITADOR_NOT_REGISTERED";
    e.payload = {
      headers: req.headers,
    };
    throw e;
  }
}

async function createInvitation(db, req, hashCode) {
  assertArguments(req);

  const [invitation, userToInviteIsStored, invitadorExists] = await getData(
    db,
    req
  );

  assertIsUserRegistered(userToInviteIsStored, req);
  assertInvitadorExists(invitadorExists, req);

  await saveInvitation(db, req, hashCode);
}

function saveInvitation(db, req, hashCode) {
  const invitador = req.headers["invite-id"];
  const invitado = req.headers["user-id"];

  const invitationToSave = {
    invitador,
    invitado,
    timestamp: timestamp(),
    key: hashCode,
  };
  return db.save("Invitations", invitationToSave);
}

function findUserToInvite(db, id) {
  return db.findOne("Users", { id });
}

module.exports = getInviteUrl;
