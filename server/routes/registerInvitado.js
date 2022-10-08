const { getProfileUrl } = require("../../auth");
const { timestamp } = require("../../time");
const { forceMeterUpdate } = require("../../forceMeterUpdate");

module.exports = (db) => async (req, res) => {
  const invitationKey = req.params.id;
  const invitation = await db.findOne("Invitations", { key: invitationKey });

  const id = invitation.invitado;

  await Promise.all([
    verifyUserIsNotRegistered(db, id),
    verifyUserNameIsAvailable(db, req.body.name),
    verifyHasOnlyLetters(req.body.name),
  ]);

  await db.save("Users", User.from(id, req.body));
  await db.giveUserSkillPointTo(id);

  await db.updateInvitationTimestamp(invitation, timestamp());

  const url = await getProfileUrl(id);

  res.status(201).send({ url });

  await forceMeterUpdate(id, db, "USER_REGISTER");
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
async function verifyUserNameIsAvailable(db, name) {
  const user = await db.findOne("Users", { name });
  if (user) {
    throw new Error(`The name "${name}" is already taken.`);
  }
}
async function verifyHasOnlyLetters(name) {
  const containsNumbers = name.match(/[\d]/);
  const containsSpecialCharacters = name.match(/[\W]/);
  if (containsNumbers || containsSpecialCharacters) {
    throw new Error("Your name can only contain letters.");
  }
}
